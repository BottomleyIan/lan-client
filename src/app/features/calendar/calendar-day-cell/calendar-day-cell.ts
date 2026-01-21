import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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
  private readonly destroyRef = inject(DestroyRef);
  readonly day = input.required<number>();
  readonly year = input.required<number>();
  readonly month = input.required<number>();
  readonly isToday = input(false);
  readonly images = input<CalendarDayImage[]>([]);
  readonly scheduledEntries = input<JournalEntryWithPriority[]>([]);
  private readonly selectedIndex = signal(0);
  private readonly rotationReset = signal(0);
  private readonly currentUrl = signal<string | null>(null);
  private readonly previousUrl = signal<string | null>(null);
  private readonly isFading = signal(false);
  private readonly fadeOut = signal(false);
  private fadeToken = 0;

  protected readonly displayImages = computed(() => this.images().slice(0, 3));
  protected readonly hasMultipleImages = computed(() => this.displayImages().length > 1);
  protected readonly gradientOverlay =
    'repeating-linear-gradient(180deg, rgb(0 0 0 / 0.2) 0px, rgb(0 0 0 / 0.3) 1px, rgb(0 0 0 / 0.2) 3px, rgb(0 0 0 /0.3) 6px),radial-gradient(circle at 0 0 ,rgb(0 0 0 / 0.7),rgb(0 0 0 / 0.1) 25%,rgb(0 0 0 / 0) 30%';

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
    effect(
      () => {
        const images = this.displayImages();
        const selected = this.selectedIndex();
        const next = images[selected]?.url ?? images[0]?.url ?? null;
        const current = this.currentUrl();
        if (next === current) {
          return;
        }
        this.fadeToken += 1;
        const token = this.fadeToken;
        if (current) {
          this.previousUrl.set(current);
          this.isFading.set(true);
          this.fadeOut.set(false);
        } else {
          this.previousUrl.set(null);
          this.isFading.set(false);
          this.fadeOut.set(false);
        }
        this.currentUrl.set(next);
        if (current) {
          window.setTimeout(() => {
            if (this.fadeToken !== token) {
              return;
            }
            this.fadeOut.set(true);
          }, 0);
          window.setTimeout(() => {
            if (this.fadeToken !== token) {
              return;
            }
            this.previousUrl.set(null);
            this.isFading.set(false);
            this.fadeOut.set(false);
          }, 500);
        }
      },
      { allowSignalWrites: true },
    );

    effect((onCleanup) => {
      const images = this.displayImages();
      this.rotationReset();
      if (images.length <= 1) {
        return;
      }
      const intervalId = window.setInterval(() => {
        this.selectedIndex.update((value) => (value + 1) % images.length);
      }, 15000);
      onCleanup(() => window.clearInterval(intervalId));
    });
  }

  protected selectImage(index: number): void {
    this.selectedIndex.set(index);
    this.rotationReset.update((value) => value + 1);
  }

  protected isSelected(index: number): boolean {
    return this.selectedIndex() === index;
  }

  protected activeImageUrl(): string | null {
    return this.currentUrl();
  }

  protected previousImageUrl(): string | null {
    return this.previousUrl();
  }

  protected fading(): boolean {
    return this.isFading();
  }

  protected fadeOutPrevious(): boolean {
    return this.fadeOut();
  }
}
