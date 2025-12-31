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
  template: `
    <div class="flex items-center gap-2">
      @if (prevLink(); as prev) {
        <a
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
          [routerLink]="prev"
          aria-label="Previous month"
        >
          <app-icon name="chevronLeft" />
        </a>
      } @else {
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-200 opacity-50"
          aria-hidden="true"
        >
          <app-icon name="chevronLeft" />
        </span>
      }
      <div
        class="font-vt323 font-black tracking-[0.14em] uppercase drop-shadow-[0_0_12px_rgba(34,211,238,0.25)]"
      >
        {{ title() }}
      </div>
      @if (nextLink(); as next) {
        <a
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
          [routerLink]="next"
          aria-label="Next month"
        >
          <app-icon name="chevronRight" />
        </a>
      } @else {
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-200 opacity-50"
          aria-hidden="true"
        >
          <app-icon name="chevronRight" />
        </span>
      }
    </div>
  `,
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
    return month === 1 ? ['/calendar', year - 1, 12] : ['/calendar', year, month - 1];
  });

  protected readonly nextLink = computed(() => {
    const year = this.year();
    const month = this.month();
    if (!year || !month) {
      return null;
    }
    return month === 12 ? ['/calendar', year + 1, 1] : ['/calendar', year, month + 1];
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
