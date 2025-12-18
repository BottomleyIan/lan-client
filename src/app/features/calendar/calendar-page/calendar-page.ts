import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';

@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, RouterLink, Panel],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly today = new Date();
  private readonly todayYear = this.today.getFullYear();
  private readonly todayMonth = this.today.getMonth() + 1;

  protected readonly year = computed(() => {
    const raw = this.params().get('year');
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) && value > 0 ? value : this.todayYear;
  });

  protected readonly month = computed(() => {
    const raw = this.params().get('month');
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) && value >= 1 && value <= 12 ? value : this.todayMonth;
  });

  protected readonly monthLabel = computed(() => {
    const monthIndex = this.month() - 1;
    return MONTH_NAMES[monthIndex] ?? 'Unknown';
  });

  protected readonly dayNames = DAY_NAMES;

  protected readonly prevLink = computed(() => {
    const month = this.month();
    const year = this.year();
    if (month === 1) {
      return { year: year - 1, month: 12 };
    }
    return { year, month: month - 1 };
  });

  protected readonly nextLink = computed(() => {
    const month = this.month();
    const year = this.year();
    if (month === 12) {
      return { year: year + 1, month: 1 };
    }
    return { year, month: month + 1 };
  });

  protected readonly days = computed(() => {
    const year = this.year();
    const month = this.month();
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;
    return Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDayIndex + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
    });
  });
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
