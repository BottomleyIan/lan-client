import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, switchMap } from 'rxjs';
import { JournalsApi } from '../../../core/api/journals.api';
import type { JournalEntryWithPriority } from '../../../core/api/journal-entry-priority';
import type { CalendarDayImage } from '../calendar-day-cell/calendar-day-cell';
import { CalendarDayCell } from '../calendar-day-cell/calendar-day-cell';
import { isAllowedTaskStatus } from '../../../shared/tasks/task-status';
import { MONTH_NAMES, DAY_NAMES } from '../calendar-constants';
import { CalendarApi } from '../../../core/api/calendar.api';
import type { HandlersCalendarImageDTO } from '../../../core/api/generated/api-types';
import { apiUrl } from '../../../core/api/api-url';

@Component({
  selector: 'app-calendar-page',
  imports: [CommonModule, CalendarDayCell],
  templateUrl: './calendar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly route = inject(ActivatedRoute);
  private readonly journalsApi = inject(JournalsApi);
  private readonly calendarApi = inject(CalendarApi);
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
  private readonly calendarImages = toSignal(
    combineLatest([toObservable(this.year), toObservable(this.month)]).pipe(
      distinctUntilChanged(
        ([prevYear, prevMonth], [nextYear, nextMonth]) =>
          prevYear === nextYear && prevMonth === nextMonth,
      ),
      switchMap(([year, month]) => this.calendarApi.listCalendarImages(year, month)),
    ),
    { initialValue: [] as HandlersCalendarImageDTO[] },
  );
  private readonly calendarImagesByDay = computed(() => {
    const byDay = new Map<number, HandlersCalendarImageDTO[]>();
    for (const image of this.calendarImages()) {
      const day = parseCalendarImageDay(image.day);
      if (day === null) {
        continue;
      }
      const existing = byDay.get(day) ?? [];
      existing.push(image);
      byDay.set(day, existing);
    }
    return byDay;
  });
  private readonly calendarDayImagesByDay = computed(() => {
    const byDay = new Map<number, CalendarDayImage[]>();
    const year = String(this.year());
    for (const [day, images] of this.calendarImagesByDay().entries()) {
      byDay.set(day, prioritizeCalendarImages(images, year));
    }
    return byDay;
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

  protected calendarImagesForDay(day: number): CalendarDayImage[] {
    return this.calendarDayImagesByDay().get(day) ?? [];
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' && key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();

    const host = this.elementRef.nativeElement;
    const active = host.ownerDocument.activeElement;
    const activeDay = active instanceof HTMLElement ? parseDay(active) : null;
    const totalDays = new Date(this.year(), this.month(), 0).getDate();
    const nextDay =
      activeDay === null
        ? 1
        : key === 'ArrowDown'
          ? activeDay + 7
          : key === 'ArrowUp'
            ? activeDay - 7
            : activeDay + (key === 'ArrowRight' ? 1 : -1);
    if (nextDay < 1 || nextDay > totalDays) {
      return;
    }

    const target = host.querySelector<HTMLElement>(`[data-calendar-day="${nextDay}"]`);
    target?.focus();
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

function parseCalendarImageDay(raw?: string): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function prioritizeCalendarImages(
  images: HandlersCalendarImageDTO[],
  year: string,
): CalendarDayImage[] {
  const mapped = images
    .map((image) => ({ image, url: resolveCalendarImageUrl(image.path) }))
    .filter((item): item is { image: HandlersCalendarImageDTO; url: string } => !!item.url)
    .map((item) => ({
      url: withImageParams(item.url, { h: 300 }),
      alt: item.image.alt ?? '',
      isYearSpecific: isYearSpecificImage(item.image, year),
    }));

  const yearSpecific = mapped.filter((image) => image.isYearSpecific);
  const repeating = mapped.filter((image) => !image.isYearSpecific);
  return [...yearSpecific, ...repeating];
}

function isYearSpecificImage(image: HandlersCalendarImageDTO, year: string): boolean {
  const path = image.path ?? '';
  return path.includes(year);
}

function resolveCalendarImageUrl(path?: string): string | null {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return apiUrl(path);
}

function parseDay(target: HTMLElement): number | null {
  const el = target.closest<HTMLElement>('[data-calendar-day]');
  if (!el) {
    return null;
  }
  const value = Number(el.dataset['calendarDay']);
  return Number.isFinite(value) ? value : null;
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
