import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import { Panel } from '../../../ui/panel/panel';
import type { HandlersJournalEntryDTO } from '../../../core/api/generated/api-types';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'app-journal-entries-page',
  imports: [CommonModule, Panel, TaskCard, CdkDropListGroup, CdkDropList, CdkDrag],
  templateUrl: './journal-entries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntriesPage {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isLoading = signal(true);
  protected readonly entries = signal<HandlersJournalEntryDTO[]>([]);
  protected readonly columns = computed(() => buildColumns(this.entries()));
  protected readonly hasVisibleEntries = computed(() =>
    this.columns().some((column) => column.entries.length > 0),
  );
  protected readonly dropListIds = computed(() => this.columns().map((column) => column.id));

  constructor() {
    this.journalsApi
      .listEntries({ type: 'task' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
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
