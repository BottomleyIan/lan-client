import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { DayView } from '../../../shared/day-view/day-view';
import { MONTH_NAMES } from '../calendar-constants';
import { NotesCreateRaw } from '../../notes/notes-create-raw/notes-create-raw';

@Component({
  selector: 'app-calendar-day-page',
  imports: [CommonModule, Panel, DayView, NotesCreateRaw],
  templateUrl: './calendar-day-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayPage {
  private readonly route = inject(ActivatedRoute);
  private readonly dayView = viewChild.required<DayView>('dayView');

  protected onCreated(): void {
    console.log('onCreated');
    this.dayView().refresh();
  }

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

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
