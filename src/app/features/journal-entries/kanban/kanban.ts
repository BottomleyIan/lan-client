import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import type { HandlersJournalEntryDTO } from '../../../core/api/generated/api-types';
import { TaskCard } from '../task-card/task-card';
import { JournalEntry } from '../journal-entry/journal-entry';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { ContainerDivDirective } from '../../../ui/directives/container-div';
import { InputDirective } from '../../../ui/directives/input';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

@Component({
  selector: 'app-journal-entries-kanban',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputDirective,
    TaskCard,
    JournalEntry,
    AppDialog,
    IconButtonDanger,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    ContainerDivDirective,
  ],
  templateUrl: './kanban.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntriesKanban {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isLoading = signal(true);
  protected readonly entries = signal<HandlersJournalEntryDTO[]>([]);
  protected readonly tag = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.queryParamMap) },
  );
  protected readonly tagControl = this.formBuilder.nonNullable.control('');
  protected readonly columns = computed(() => buildColumns(this.entries()));
  protected readonly hasVisibleEntries = computed(() =>
    this.columns().some((column) => column.entries.length > 0),
  );
  protected readonly dropListIds = computed(() => this.columns().map((column) => column.id));
  protected readonly tagOptions = computed(() => collectTags(this.entries()));
  protected readonly selectedEntry = signal<HandlersJournalEntryDTO | null>(null);

  constructor() {
    toObservable(this.tag)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const currentTag = this.tag();
        if (this.tagControl.value !== currentTag) {
          this.tagControl.setValue(currentTag, { emitEvent: false });
        }
        this.fetchEntries();
      });
    this.tagControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        void this.router.navigate([], {
          queryParams: { tag: value || null },
          queryParamsHandling: 'merge',
        });
      });
  }

  protected drop(event: CdkDragDrop<HandlersJournalEntryDTO[]>, status: BoardStatusKey): void {
    const entry = event.item.data;
    const nextStatus = status;
    if (!entry || entry.status === nextStatus) {
      return;
    }

    const entryKey = getEntryKey(entry);
    if (!entryKey || !entry.year || !entry.month || !entry.day || entry.position === undefined) {
      return;
    }

    const previousStatus = entry.status;
    this.updateEntryStatus(entryKey, nextStatus);

    this.journalsApi
      .updateJournalEntryStatus(entry.year, entry.month, entry.day, entry.position, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedEntry) => {
          this.replaceEntry(entryKey, updatedEntry);
        },
        error: () => {
          this.updateEntryStatus(entryKey, previousStatus);
        },
      });
  }

  protected trackColumn(_: number, column: KanbanColumn): string {
    return column.id;
  }

  protected trackEntry(_: number, entry: HandlersJournalEntryDTO): string {
    return getEntryKey(entry) ?? '';
  }

  protected openEntry(entry: HandlersJournalEntryDTO): void {
    this.selectedEntry.set(entry);
  }

  protected closeEntry(): void {
    this.selectedEntry.set(null);
  }

  protected handleEntryDeleted(entry: HandlersJournalEntryDTO): void {
    this.entries.update((entries) =>
      entries.filter((entryItem) => getEntryKey(entryItem) !== getEntryKey(entry)),
    );
  }

  private updateEntryStatus(entryKey: string, status?: string): void {
    this.entries.update((entries) =>
      entries.map((entry) => {
        if (getEntryKey(entry) !== entryKey) {
          return entry;
        }
        return { ...entry, status };
      }),
    );
  }

  private replaceEntry(entryKey: string, updatedEntry: HandlersJournalEntryDTO): void {
    this.entries.update((entries) =>
      entries.map((entry) => (getEntryKey(entry) === entryKey ? updatedEntry : entry)),
    );
  }

  private fetchEntries(): void {
    this.isLoading.set(true);
    const tag = this.tag();
    this.journalsApi
      .listEntries({ type: 'task', tag: tag ? [tag] : undefined })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      });
  }
}

type BoardStatusKey = 'TODO' | 'DOING' | 'LATER' | 'DONE' | 'CANCELLED';

type KanbanColumn = {
  id: string;
  key: BoardStatusKey;
  label: string;
  entries: HandlersJournalEntryDTO[];
};

const BOARD_COLUMNS: Array<{ key: BoardStatusKey; label: string }> = [
  { key: 'TODO', label: 'Todo' },
  { key: 'DOING', label: 'Doing' },
  { key: 'LATER', label: 'Later' },
  { key: 'DONE', label: 'Done' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const RECENT_STATUS_KEYS = new Set<BoardStatusKey>(['DONE', 'CANCELLED']);
const RECENT_WINDOW_DAYS = 7;

function buildColumns(entries: HandlersJournalEntryDTO[]): KanbanColumn[] {
  const buckets = new Map<BoardStatusKey, HandlersJournalEntryDTO[]>();
  BOARD_COLUMNS.forEach((column) => buckets.set(column.key, []));

  entries.forEach((entry) => {
    const status = normalizeStatus(entry.status);
    if (RECENT_STATUS_KEYS.has(status) && !isRecent(entry)) {
      return;
    }
    const bucket = buckets.get(status);
    if (bucket) {
      bucket.push(entry);
    }
  });

  return BOARD_COLUMNS.map((column) => ({
    id: `task-column-${column.key.toLowerCase()}`,
    key: column.key,
    label: column.label,
    entries: buckets.get(column.key) ?? [],
  }));
}

function normalizeStatus(status?: string): BoardStatusKey {
  if (!status) {
    return 'TODO';
  }
  const key = status.trim().toUpperCase();
  return BOARD_COLUMNS.some((column) => column.key === key) ? (key as BoardStatusKey) : 'TODO';
}

function getEntryKey(entry: HandlersJournalEntryDTO): string | null {
  if (entry.hash) {
    return entry.hash;
  }
  if (entry.id !== undefined) {
    return String(entry.id);
  }
  return null;
}

function isRecent(entry: HandlersJournalEntryDTO): boolean {
  const updatedAt = entry.updated_at ?? entry.created_at;
  if (!updatedAt) {
    return true;
  }
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return true;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);
  return parsed >= cutoff;
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}

function collectTags(entries: HandlersJournalEntryDTO[]): string[] {
  const tags = new Set<string>();
  entries.forEach((entry) => {
    entry.tags?.forEach((tag) => {
      if (tag.trim().length > 0) {
        tags.add(tag);
      }
    });
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}
