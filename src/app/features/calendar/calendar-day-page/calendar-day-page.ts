import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Panel } from '../../../ui/panel/panel';
import { DayView } from '../../../shared/day-view/day-view';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';
import { ConfirmButtonDirective } from '../../../ui/directives/confirm-button';
import { JournalsApi } from '../../../core/api/journals.api';
import { MONTH_NAMES } from '../calendar-constants';

@Component({
  selector: 'app-calendar-day-page',
  imports: [
    CommonModule,
    Panel,
    DayView,
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    ConfirmButtonDirective,
  ],
  templateUrl: './calendar-day-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayPage {
  private readonly journalsApi = inject(JournalsApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly dayView = viewChild.required<DayView>('dayView');

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

  protected readonly isSaving = signal(false);
  protected readonly createForm = this.formBuilder.nonNullable.group({
    raw: ['', [Validators.required]],
  });

  protected submitRaw(): void {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return;
    }

    const rawControl = this.createForm.controls.raw;
    const trimmed = rawControl.value.trim();
    rawControl.setValue(trimmed);
    if (!trimmed) {
      rawControl.markAsTouched();
      return;
    }

    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.journalsApi
      .createJournalEntryRaw(year, month, day, { raw: trimmed })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.createForm.reset({ raw: '' });
          rawControl.markAsUntouched();
          this.dayView().refresh();
        },
      });
  }
}

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
