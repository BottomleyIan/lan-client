import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, startWith, Subject, switchMap } from 'rxjs';
import { CalendarApi } from '../../core/api/calendar.api';
import { NotesApi } from '../../core/api/notes.api';
import { TasksApi } from '../../core/api/tasks.api';
import type { HandlersNoteDTO, HandlersTaskDTO } from '../../core/api/generated/api-types';
import { CalendarTask } from '../../features/calendar/calendar-task/calendar-task';
import { MarkdownBody } from '../markdown/markdown-body';
import { Tags } from '../../features/tags/tags';

type DayParams = { year: number; month: number; day: number };

@Component({
  selector: 'app-day-view',
  imports: [CommonModule, CalendarTask, MarkdownBody, Tags],
  templateUrl: './day-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayView {
  private readonly calendarApi = inject(CalendarApi);
  private readonly notesApi = inject(NotesApi);
  private readonly tasksApi = inject(TasksApi);

  readonly year = input<number | null>(null);
  readonly month = input<number | null>(null);
  readonly day = input<number | null>(null);
  readonly tag = input<string | null>(null);

  private readonly refresh$ = new Subject<void>();
  private readonly dayParams = computed(() => toDayParams(this.year(), this.month(), this.day()));

  protected readonly data$ = combineLatest({
    dayParams: toObservable(this.dayParams),
    tag: toObservable(this.tag),
    refresh: this.refresh$.pipe(startWith(undefined)),
  }).pipe(
    switchMap(({ dayParams, tag }) => {
      if (dayParams) {
        return this.calendarApi
          .getDayView(dayParams.year, dayParams.month, dayParams.day)
          .pipe(map((view) => ({ notes: view.notes ?? [], tasks: view.tasks ?? [] })));
      }
      if (tag) {
        return combineLatest({
          notes: this.notesApi.getNotes({ tag }),
          tasks: this.tasksApi.getTasks({ tags: [tag] }),
        });
      }
      return combineLatest({
        notes: this.notesApi.getNotes(),
        tasks: this.tasksApi.getTasks(),
      });
    }),
  );

  protected trackTaskId(_: number, task: HandlersTaskDTO): number | string {
    return task.id ?? task.hash ?? `${task.year}-${task.month}-${task.day}-${task.position}`;
  }

  protected trackNoteId(_: number, note: HandlersNoteDTO): number | string {
    return note.id ?? note.hash ?? `${note.year}-${note.month}-${note.day}-${note.position}`;
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
