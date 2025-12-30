import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { CalendarTask } from '../calendar-task/calendar-task';
import { MONTH_NAMES } from '../calendar-constants';
import { filter, map, merge, Subject, switchMap } from 'rxjs';
import { CalendarApi } from '../../../core/api/calendar.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HandlersTaskDTO } from '../../../core/api/generated/api-types';

@Component({
  selector: 'app-calendar-day-page',
  imports: [CommonModule, RouterLink, Panel, CalendarTask],
  templateUrl: './calendar-day-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayPage {
  private readonly route = inject(ActivatedRoute);
  private readonly calendarApi = inject(CalendarApi);
  private readonly refresh$ = new Subject<void>();

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly dayParams$ = merge(
    this.route.paramMap.pipe(map(readDayParams)),
    this.refresh$.pipe(map(() => readDayParams(this.route.snapshot.paramMap))),
  ).pipe(filter((params): params is DayParams => params !== null));

  protected readonly data$ = this.dayParams$.pipe(
    switchMap(({ year, month, day }) => this.calendarApi.getDayView(year, month, day)),
  );

  protected readonly year = computed(() => toNumber(this.params().get('year')));
  protected readonly month = computed(() => toNumber(this.params().get('month')));
  protected readonly day = computed(() => toNumber(this.params().get('day')));
  protected readonly prevLink = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return null;
    }
    return shiftDay({ year, month, day }, -1);
  });

  protected readonly nextLink = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return null;
    }
    return shiftDay({ year, month, day }, 1);
  });
  protected readonly title = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return 'Calendar';
    }
    return `${MONTH_NAMES[month - 1] ?? 'Month'} ${day}, ${year}`;
  });

  protected handleTaskDeleted(_task: HandlersTaskDTO): void {
    this.refresh$.next();
  }
}

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

type DateParts = { year: number; month: number; day: number };
type DayParams = { year: number; month: number; day: number };

function readDayParams(params: ParamMap): DayParams | null {
  const year = toNumber(params.get('year'));
  const month = toNumber(params.get('month'));
  const day = toNumber(params.get('day'));
  if (!year || !month || !day) {
    return null;
  }
  return { year, month, day };
}

function shiftDay(current: DateParts, delta: number): DateParts {
  const date = new Date(current.year, current.month - 1, current.day);
  date.setDate(date.getDate() + delta);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}
