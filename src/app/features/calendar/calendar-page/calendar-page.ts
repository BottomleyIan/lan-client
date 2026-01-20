import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import type { JournalEntryWithPriority } from '../../../core/api/journal-entry-priority';
import { CalendarEntry } from '../calendar-entry/calendar-entry';
import { isAllowedTaskStatus } from '../../../shared/tasks/task-status';
import { MONTH_NAMES, DAY_NAMES } from '../calendar-constants';
import { ImagesApi } from '../../../core/api/images.api';

@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, RouterLink, CalendarEntry],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly route = inject(ActivatedRoute);
  private readonly journalsApi = inject(JournalsApi);
  private readonly imagesApi = inject(ImagesApi);
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

  protected readonly todayDay = this.today.getDate();

  protected readonly monthLabel = computed(() => {
    const monthIndex = this.month() - 1;
    return MONTH_NAMES[monthIndex] ?? 'Unknown';
  });

  protected readonly dayNames = DAY_NAMES;

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
  private readonly calendarImages = toSignal(this.imagesApi.listImages('calendar'), {
    initialValue: [],
  });

  protected readonly entriesByDay = computed(() => {
    const year = this.year();
    const month = this.month();
    const byDay = new Map<number, JournalEntryWithPriority[]>();

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

  protected readonly scheduledEntriesByDay = computed(() => {
    const year = this.year();
    const month = this.month();
    const byDay = new Map<number, JournalEntryWithPriority[]>();

    for (const entry of this.entries()) {
      if (!isAllowedTaskStatus(entry.status)) {
        continue;
      }
      const date = parseDateParts(entry.scheduled_at);
      if (!date || date.year !== year || date.month !== month) {
        continue;
      }
      const dayEntries = byDay.get(date.day) ?? [];
      dayEntries.push(entry);
      byDay.set(date.day, dayEntries);
    }

    return byDay;
  });

  protected entriesForDay(day: number): JournalEntryWithPriority[] {
    return this.entriesByDay().get(day) ?? [];
  }

  protected scheduledEntriesForDay(day: number): JournalEntryWithPriority[] {
    return this.scheduledEntriesByDay().get(day) ?? [];
  }

  protected isToday(day: number): boolean {
    return (
      this.year() === this.todayYear && this.month() === this.todayMonth && day === this.todayDay
    );
  }

  protected dayBackground(day: number): string | null {
    const month = String(this.month()).padStart(2, '0');
    const dayValue = String(day).padStart(2, '0');
    const yearValue = String(this.year());
    const yearSpecific = `${month}-${dayValue}.${yearValue}.webp`;
    const fallback = `${month}-${dayValue}.webp`;
    const images = this.calendarImages().map((name) => name.toLowerCase());
    if (images.includes(yearSpecific.toLowerCase())) {
      return withImageParams(this.imagesApi.imageUrl('calendar', yearSpecific), { h: 300 });
    }
    if (images.includes(fallback.toLowerCase())) {
      return withImageParams(this.imagesApi.imageUrl('calendar', fallback), { h: 300 });
    }
    return null;
  }
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

function resolveEntryDate(entry: JournalEntryWithPriority): DateParts | null {
  return (
    parseDateParts(entry.deadline_at) ??
    parseDateParts(entry.scheduled_at) ??
    parseDatePartsFromFields(entry)
  );
}

function parseDatePartsFromFields(entry: JournalEntryWithPriority): DateParts | null {
  if (!entry.year || !entry.month || !entry.day) {
    return null;
  }
  return { year: entry.year, month: entry.month, day: entry.day };
}

function withImageParams(baseUrl: string, params: Record<string, string | number>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  if (!query) {
    return baseUrl;
  }
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${query}`;
}
type DateParts = { year: number; month: number; day: number };
