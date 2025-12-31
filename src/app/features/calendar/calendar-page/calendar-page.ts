import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import type { HandlersJournalEntryDTO } from '../../../core/api/generated/api-types';
import { CalendarEntry } from '../calendar-entry/calendar-entry';
import { isAllowedTaskStatus } from '../../../shared/tasks/task-status';
import { MONTH_NAMES, DAY_NAMES } from '../calendar-constants';

@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, RouterLink, CalendarEntry],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly route = inject(ActivatedRoute);
  private readonly journalsApi = inject(JournalsApi);
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

  private readonly entries = toSignal(this.journalsApi.listEntries({ type: 'task' }), {
    initialValue: [],
  });

  protected readonly entriesByDay = computed(() => {
    const year = this.year();
    const month = this.month();
    const byDay = new Map<number, HandlersJournalEntryDTO[]>();

    for (const entry of this.entries()) {
      if (!isAllowedTaskStatus(entry.status)) {
        continue;
      }
      const date = resolveEntryDate(entry);
      if (!date || date.year !== year || date.month !== month) {
        continue;
      }
      const dayEntries = byDay.get(date.day) ?? [];
      dayEntries.push(entry);
      byDay.set(date.day, dayEntries);
    }

    return byDay;
  });

  protected entriesForDay(day: number): HandlersJournalEntryDTO[] {
    return this.entriesByDay().get(day) ?? [];
  }
}

type DateParts = { year: number; month: number; day: number };

function resolveEntryDate(entry: HandlersJournalEntryDTO): DateParts | null {
  return (
    parseDateParts(entry.deadline_at) ??
    parseDateParts(entry.scheduled_at) ??
    parseDatePartsFromFields(entry)
  );
}

function parseDateParts(raw?: string): DateParts | null {
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function parseDatePartsFromFields(entry: HandlersJournalEntryDTO): DateParts | null {
  if (!entry.year || !entry.month || !entry.day) {
    return null;
  }
  return { year: entry.year, month: entry.month, day: entry.day };
}
