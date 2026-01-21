import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { JournalEntryWithPriority } from '../../../core/api/journal-entry-priority';
import { CalendarEntry } from '../calendar-entry/calendar-entry';

export type CalendarDayImage = {
  url: string;
  alt: string;
  isYearSpecific?: boolean;
};

@Component({
  selector: 'app-calendar-day-cell',
  imports: [CommonModule, RouterLink, CalendarEntry],
  templateUrl: './calendar-day-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full h-full' },
})
export class CalendarDayCell {
  readonly day = input.required<number>();
  readonly year = input.required<number>();
  readonly month = input.required<number>();
  readonly isToday = input(false);
  readonly images = input<CalendarDayImage[]>([]);
  readonly scheduledEntries = input<JournalEntryWithPriority[]>([]);
  private readonly selectedIndex = signal(0);

  protected readonly displayImages = computed(() => this.images().slice(0, 3));
  protected readonly hasMultipleImages = computed(() => this.displayImages().length > 1);
  protected readonly backgroundImage = computed(() => {
    const selected = this.displayImages()[this.selectedIndex()] ?? this.displayImages()[0];
    const image = selected?.url;
    if (!image) {
      return null;
    }
    return `repeating-linear-gradient(180deg, rgb(0 0 0 / 0.2) 0px, rgb(0 0 0 / 0.3) 1px, rgb(0 0 0 / 0.2) 3px, rgb(0 0 0 /0.3) 6px),radial-gradient(circle at 5% 5%,rgb(0 0 0 / 1),rgb(0 0 0 / 0.1) 30%),url(${image})`;
  });

  protected readonly showScheduledEntries = computed(
    () => this.scheduledEntries().length > 0 && this.images().length === 0,
  );

  constructor() {
    effect(
      () => {
        const images = this.images();
        const selected = this.selectedIndex();
        if (!images.length) {
          this.selectedIndex.set(0);
          return;
        }
        if (selected >= images.length) {
          this.selectedIndex.set(0);
        }
      },
      { allowSignalWrites: true },
    );
  }

  protected selectImage(index: number): void {
    this.selectedIndex.set(index);
  }

  protected isSelected(index: number): boolean {
    return this.selectedIndex() === index;
  }
}
