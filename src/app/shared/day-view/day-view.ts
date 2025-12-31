import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, startWith, Subject, switchMap } from 'rxjs';
import type { HandlersJournalEntryDTO } from '../../core/api/generated/api-types';
import { CalendarTask } from '../../features/calendar/calendar-task/calendar-task';
import { MarkdownBody } from '../markdown/markdown-body';
import { JournalsApi } from '../../core/api/journals.api';

type DayParams = { year: number; month: number; day: number };

@Component({
  selector: 'app-day-view',
  imports: [CommonModule, CalendarTask, MarkdownBody],
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

  protected trackEntryId(_: number, task: HandlersJournalEntryDTO): number | string {
    return task.id ?? task.hash ?? `${task.year}-${task.month}-${task.day}-${task.position}`;
  }

  protected handleTaskDeleted(): void {
    this.refresh$.next();
  }
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
