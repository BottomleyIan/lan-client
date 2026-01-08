import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { toObservable, toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import type { JournalEntryWithPriority } from '../../../core/api/journal-entry-priority';
import { withEntryPriority } from '../../../core/api/journal-entry-priority';
import { TaskCard } from '../task-card/task-card';
import { JournalEntry } from '../journal-entry/journal-entry';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { ContainerDivDirective } from '../../../ui/directives/container-div';
import { InputDirective } from '../../../ui/directives/input';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { NgxElectricBorderComponent } from '@omnedia/ngx-electric-border';

@Component({
  selector: 'app-journal-entries-kanban',
  imports: [
    CommonModule,
    NgOptimizedImage,
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
    NgxElectricBorderComponent,
  ],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntriesKanban {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isLoading = signal(true);
  protected readonly entries = signal<JournalEntryWithPriority[]>([]);
  protected readonly tag = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.queryParamMap) },
  );
  protected readonly tagControl = this.formBuilder.nonNullable.control('');
  protected readonly filteredEntries = computed(() =>
    filterEntriesByPriority(this.entries(), this.priority()),
  );
  protected readonly columns = computed(() => buildColumns(this.filteredEntries()));
  protected readonly hasVisibleEntries = computed(() =>
    this.columns().some((column) => column.entries.length > 0),
  );
  protected readonly dropListIds = computed(() => this.columns().map((column) => column.id));
  protected readonly tagOptions = computed(() => collectTags(this.entries()));
  protected readonly selectedEntry = signal<JournalEntryWithPriority | null>(null);
  protected readonly priority = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizePriority(params))),
    { initialValue: normalizePriority(this.route.snapshot.queryParamMap) },
  );
  protected readonly priorityControl = this.formBuilder.nonNullable.control<PriorityFilter>('all');
  protected readonly priorityOptions = PRIORITY_FILTER_OPTIONS;
  protected readonly scrollStates = signal<Record<string, ScrollState>>({});

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
    toObservable(this.priority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const currentPriority = this.priority();
        if (this.priorityControl.value !== currentPriority) {
          this.priorityControl.setValue(currentPriority, { emitEvent: false });
        }
      });
    this.priorityControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        void this.router.navigate([], {
          queryParams: { priority: value === 'all' ? null : value },
          queryParamsHandling: 'merge',
        });
      });

    effect(() => {
      this.filteredEntries();
      this.scheduleScrollStateRefresh();
    });
  }


  protected drop(event: CdkDragDrop<JournalEntryWithPriority[]>, status: BoardStatusKey): void {
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
          this.replaceEntry(entryKey, withEntryPriority(updatedEntry));
        },
        error: () => {
          this.updateEntryStatus(entryKey, previousStatus);
        },
      });
  }

  protected trackColumn(_: number, column: KanbanColumn): string {
    return column.id;
  }

  protected trackEntry(_: number, entry: JournalEntryWithPriority): string {
    return getEntryKey(entry) ?? '';
  }

  protected openEntry(entry: JournalEntryWithPriority): void {
    this.selectedEntry.set(entry);
  }

  protected closeEntry(): void {
    this.selectedEntry.set(null);
  }

  protected handleEntryDeleted(entry: JournalEntryWithPriority): void {
    this.entries.update((entries) =>
      entries.filter((entryItem) => getEntryKey(entryItem) !== getEntryKey(entry)),
    );
  }

  protected updateScrollState(id: string, element: HTMLElement): void {
    if (!id) {
      return;
    }
    this.setScrollState(id, computeScrollState(element));
  }

  protected scrollState(id: string): ScrollState {
    return this.scrollStates()[id] ?? { canScrollUp: false, canScrollDown: false };
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

  private replaceEntry(entryKey: string, updatedEntry: JournalEntryWithPriority): void {
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
        this.scheduleScrollStateRefresh();
      });
  }

  private scheduleScrollStateRefresh(): void {
    queueMicrotask(() => {
      requestAnimationFrame(() => this.refreshScrollStates());
    });
  }

  private refreshScrollStates(): void {
    const hostElement = this.host.nativeElement;
    const scrollColumns = hostElement.querySelectorAll<HTMLElement>('.tasks-column-scroll-container');
    scrollColumns.forEach((element) => {
      const id = element.dataset['scrollId'] ?? '';
      if (!id) {
        return;
      }
      this.updateScrollState(id, element);
    });
  }

  private setScrollState(id: string, state: ScrollState): void {
    this.scrollStates.update((states) => ({ ...states, [id]: state }));
  }
}

type BoardStatusKey = 'TODO' | 'DOING' | 'LATER' | 'DONE' | 'CANCELLED';

type KanbanColumn = {
  id: string;
  key: BoardStatusKey;
  label: string;
  imageSrc: string;
  entries: JournalEntryWithPriority[];
};

type ScrollState = {
  canScrollUp: boolean;
  canScrollDown: boolean;
};

const BOARD_COLUMNS: Array<{ key: BoardStatusKey; label: string; imageSrc: string }> = [
  { key: 'TODO', label: 'Todo', imageSrc: '/todo.png' },
  { key: 'DOING', label: 'Doing', imageSrc: '/doing.png' },
  { key: 'LATER', label: 'Later', imageSrc: '/later.png' },
  { key: 'DONE', label: 'Done', imageSrc: '/done.png' },
  { key: 'CANCELLED', label: 'Cancelled', imageSrc: '/cancelled.png' },
];

const RECENT_STATUS_KEYS = new Set<BoardStatusKey>(['DONE', 'CANCELLED']);
const RECENT_WINDOW_DAYS = 7;

function buildColumns(entries: JournalEntryWithPriority[]): KanbanColumn[] {
  const buckets = new Map<BoardStatusKey, JournalEntryWithPriority[]>();
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
    imageSrc: column.imageSrc,
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

function getEntryKey(entry: JournalEntryWithPriority): string | null {
  if (entry.hash) {
    return entry.hash;
  }
  if (entry.id !== undefined) {
    return String(entry.id);
  }
  return null;
}

function isRecent(entry: JournalEntryWithPriority): boolean {
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

function collectTags(entries: JournalEntryWithPriority[]): string[] {
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

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

const PRIORITY_FILTER_OPTIONS: Array<{ value: PriorityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function normalizePriority(params: ParamMap): PriorityFilter {
  const raw = params.get('priority')?.trim().toLowerCase();
  if (raw === 'high' || raw === 'medium' || raw === 'low') {
    return raw;
  }
  return 'all';
}

function filterEntriesByPriority(
  entries: JournalEntryWithPriority[],
  priority: PriorityFilter,
): JournalEntryWithPriority[] {
  if (priority === 'all') {
    return entries;
  }
  return entries.filter((entry) => entry.priority === priority);
}

function computeScrollState(element: HTMLElement): ScrollState {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const canScrollUp = scrollTop > 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;
  return { canScrollUp, canScrollDown };
}
