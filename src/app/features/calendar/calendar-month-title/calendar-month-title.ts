import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MONTH_NAMES } from '../calendar-constants';
import { Icon } from '../../../ui/icon/icon';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-calendar-month-title',
  imports: [CommonModule, RouterLink, Icon],
  templateUrl: './calendar-month-title.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthTitle {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly activeRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => getActiveRoute(this.router.routerState.snapshot.root)),
    ),
    { initialValue: getActiveRoute(this.router.routerState.snapshot.root) },
  );

  private readonly year = computed(() =>
    toNumber(this.activeRoute()?.paramMap?.get('year') ?? null),
  );
  private readonly month = computed(() =>
    toNumber(this.activeRoute()?.paramMap?.get('month') ?? null),
  );

  protected readonly title = computed(() => {
    const year = this.year();
    const month = this.month();
    if (!year || !month) {
      return 'Calendar';
    }
    return `${MONTH_NAMES[month - 1] ?? 'Month'} ${year}`;
  });

  protected readonly prevLink = computed(() => {
    const year = this.year();
    const month = this.month();
    if (!year || !month) {
      return null;
    }
    return month === 1 ? ['/notes', year - 1, 12] : ['/notes', year, month - 1];
  });

  protected readonly nextLink = computed(() => {
    const year = this.year();
    const month = this.month();
    if (!year || !month) {
      return null;
    }
    return month === 12 ? ['/notes', year + 1, 1] : ['/notes', year, month + 1];
  });
}

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function getActiveRoute(route: ActivatedRoute['snapshot']): ActivatedRoute['snapshot'] | null {
  let current: ActivatedRoute['snapshot'] | null = route;
  while (current?.firstChild) {
    current = current.firstChild;
  }
  return current;
}
