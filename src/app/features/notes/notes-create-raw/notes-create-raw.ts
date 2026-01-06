import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';
import { ConfirmButtonDirective } from '../../../ui/directives/confirm-button';
import { JournalsApi } from '../../../core/api/journals.api';

@Component({
  selector: 'app-notes-create-raw',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    ConfirmButtonDirective,
  ],
  templateUrl: './notes-create-raw.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesCreateRaw {
  private readonly journalsApi = inject(JournalsApi);
  private readonly formBuilder = inject(FormBuilder);
  //private readonly dayView = viewChild.required<DayView>('dayView');

  readonly year = input.required<number | string | null>();
  readonly month = input.required<number | string | null>();
  readonly day = input.required<number | string | null>();
  readonly noteCreated = output<void>();

  protected readonly isSaving = signal(false);
  protected readonly createForm = this.formBuilder.nonNullable.group({
    raw: ['', [Validators.required]],
  });

  protected submitRaw(): void {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    console.log(year, month, day);
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
          this.noteCreated.emit();
        },
      });
  }
}
