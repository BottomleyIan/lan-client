import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { CalendarTask } from '../calendar-task/calendar-task';
import { MONTH_NAMES } from '../calendar-constants';
import { filter, map, switchMap } from 'rxjs';
import { CalendarApi } from '../../../core/api/calendar.api';

@Component({
  selector: 'app-calendar-day-page',
  imports: [CommonModule, RouterLink, Panel, CalendarTask],
  templateUrl: './calendar-day-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayPage {
  private readonly route = inject(ActivatedRoute);
  private readonly calendarApi = inject(CalendarApi);

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly data$ = this.route.paramMap.pipe(
    map((params) => ({
      year: toNumber(params.get('year')),
      month: toNumber(params.get('month')),
      day: toNumber(params.get('day')),
    })),
    filter(
      (params): params is { year: number; month: number; day: number } =>
        params.year !== null && params.month !== null && params.day !== null,
    ),
    switchMap(({ year, month, day }) => this.calendarApi.getDayView(year, month, day)),
  );

  protected readonly year = computed(() => toNumber(this.params().get('year')));
  protected readonly month = computed(() => toNumber(this.params().get('month')));
  protected readonly day = computed(() => toNumber(this.params().get('day')));
  protected readonly title = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return 'Calendar';
    }
    return `${MONTH_NAMES[month - 1] ?? 'Month'} ${day}, ${year}`;
  });
}

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
