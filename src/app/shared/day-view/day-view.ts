import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, Subject, switchMap } from 'rxjs';
import type { JournalEntryWithPriority } from '../../core/api/journal-entry-priority';
import { JournalsApi } from '../../core/api/journals.api';
import { JournalEntry } from '../../features/journal-entries/journal-entry/journal-entry';

type DayParams = { year: number; month: number; day: number };

@Component({
  selector: 'app-day-view',
  imports: [CommonModule, JournalEntry],
  templateUrl: './day-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayView {
  private readonly journalsApi = inject(JournalsApi);

  readonly year = input<number | null>(null);
  readonly month = input<number | null>(null);
  readonly day = input<number | null>(null);
  readonly tag = input<string | null>(null);

  private readonly refresh$ = new Subject<void>();
  private readonly dayParams = computed(() => toDayParams(this.year(), this.month(), this.day()));

  protected readonly entries$ = combineLatest({
    dayParams: toObservable(this.dayParams),
    tag: toObservable(this.tag),
    refresh: this.refresh$.pipe(startWith(undefined)),
  }).pipe(
    switchMap(({ dayParams, tag }) =>
      this.journalsApi.listEntries({ ...dayParams, tags: tag ? [tag] : undefined }),
    ),
  );

  readonly hasEntries$ = this.entries$.pipe(map((entries) => entries.length > 0));

  protected trackEntryId(_: number, entry: JournalEntryWithPriority): number | string {
    return entry.id ?? entry.hash ?? `${entry.year}-${entry.month}-${entry.day}-${entry.position}`;
  }

  protected handleEntryDeleted(): void {
    this.refresh$.next();
  }
  readonly table$ = this.entries$.pipe(
    map((entries) => {
      const table = entries.reduce(
        (acc, entry) => {
          const row = entryToRow(entry);
          if (row == null) return acc;
          acc.rows.push(row);
          for (const key of Object.keys(row)) {
            acc.columns.add(key);
          }
          return acc;
        },
        { rows: [], columns: new Set() } as {
          rows: Record<string, string>[];
          columns: Set<string>;
        },
      );

      console.log(table);
      return table;
    }),
  );

  refresh(): void {
    this.refresh$.next();
  }
}

function entryToRow(entry: JournalEntryWithPriority): Record<string, string> | null {
  const resp = {} as Record<string, string>;
  const separateLines = entry.body?.match(/[^\r\n]+/g);
  if (separateLines?.length) {
    for (const line of separateLines) {
      const parts = line.split('::');
      console.log(line, parts);
      if (parts.length == 2) {
        resp[parts[0]] = parts[1];
      }
    }
  }
  return Object.keys(resp).length ? resp : null;
}

function toDayParams(
  year: number | null,
  month: number | null,
  day: number | null,
): DayParams | null {
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}
