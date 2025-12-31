import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MONTH_NAMES } from '../calendar-constants';
import { Icon } from '../../../ui/icon/icon';

@Component({
  selector: 'app-calendar-day-title',
  imports: [CommonModule, RouterLink, Icon],
  template: `
    <div class="flex items-center gap-2">
      @if (prevLink(); as prev) {
        <a
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-200 transition hover:border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
          [routerLink]="prev"
          aria-label="Previous day"
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
          aria-label="Next day"
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
export class CalendarDayTitle {
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

  private readonly dateParts = computed(() => {
    const current = this.activeRoute();
    const year = toNumber(current?.paramMap?.get('year') ?? null);
    const month = toNumber(current?.paramMap?.get('month') ?? null);
    const day = toNumber(current?.paramMap?.get('day') ?? null);
    if (!year || !month || !day) {
      return null;
    }
    return { year, month, day };
  });

  protected readonly title = computed(() => {
    const parts = this.dateParts();
    if (!parts) {
      return 'Calendar';
    }
    const monthName = MONTH_NAMES[parts.month - 1] ?? 'Month';
    return `${monthName} ${parts.day}, ${parts.year}`;
  });

  protected readonly prevLink = computed(() => {
    const parts = this.dateParts();
    if (!parts) {
      return null;
    }
    const prev = shiftDay(parts, -1);
    return ['/calendar', prev.year, prev.month, prev.day];
  });

  protected readonly nextLink = computed(() => {
    const parts = this.dateParts();
    if (!parts) {
      return null;
    }
    const next = shiftDay(parts, 1);
    return ['/calendar', next.year, next.month, next.day];
  });
}

type DateParts = { year: number; month: number; day: number };

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function shiftDay(current: DateParts, delta: number): DateParts {
  const date = new Date(current.year, current.month - 1, current.day);
  date.setDate(date.getDate() + delta);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function getActiveRoute(route: ActivatedRoute['snapshot']): ActivatedRoute['snapshot'] | null {
  let current: ActivatedRoute['snapshot'] | null = route;
  while (current?.firstChild) {
    current = current.firstChild;
  }
  return current;
}
