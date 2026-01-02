import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { JournalsApi } from '../../../core/api/journals.api';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { Panel } from '../../../ui/panel/panel';

@Component({
  selector: 'app-notes-new-page',
  imports: [
    Panel,
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    IconButtonPrimary,
    IconButtonDanger,
  ],
  templateUrl: './notes-new-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesNewPage {
  private readonly journalsApi = inject(JournalsApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly isSaving = signal(false);
  protected readonly entryStatuses = TASK_STATUSES;

  protected readonly form = this.formBuilder.nonNullable.group({
    body: ['', [Validators.required]],
    description: [''],
    tags: [''],
    status: [''],
    scheduledDate: [''],
    scheduledTime: [''],
    deadlineDate: [''],
    deadlineTime: [''],
  });

  protected get body(): FormControl<string> {
    return this.form.controls.body;
  }

  protected submit(): void {
    const trimmedBody = this.body.value.trim();
    this.body.setValue(trimmedBody);

    if (!trimmedBody) {
      this.body.markAsTouched();
      return;
    }

    if (this.isSaving()) {
      return;
    }

    const description = this.form.controls.description.value.trim();
    const tags = this.parseTags(this.form.controls.tags.value);
    const status = this.form.controls.status.value.trim();
    const scheduledDate = this.form.controls.scheduledDate.value.trim();
    const scheduledTime = this.form.controls.scheduledTime.value.trim();
    const deadlineDate = this.form.controls.deadlineDate.value.trim();
    const deadlineTime = this.form.controls.deadlineTime.value.trim();
    const scheduled = toIsoOrDate(scheduledDate, scheduledTime);
    const deadline = toIsoOrDate(deadlineDate, deadlineTime);
    const targetDate = toCalendarDate(scheduledDate);

    this.isSaving.set(true);

    this.journalsApi
      .createJournalEntry({
        body: trimmedBody,
        description: description || undefined,
        tags: tags.length ? tags : undefined,
        status: status || undefined,
        scheduled: scheduled || undefined,
        deadline: deadline || undefined,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({
            body: '',
            description: '',
            tags: '',
            status: '',
            scheduledDate: '',
            scheduledTime: '',
            deadlineDate: '',
            deadlineTime: '',
          });
          void this.router.navigate([
            '/calendar',
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            targetDate.getDate(),
          ]);
        },
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/notes']);
  }

  protected handleEntryToggle(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) {
      return;
    }
    if (!target.open) {
      this.form.controls.status.setValue('');
      this.form.controls.scheduledDate.setValue('');
      this.form.controls.scheduledTime.setValue('');
      this.form.controls.deadlineDate.setValue('');
      this.form.controls.deadlineTime.setValue('');
    }
  }

  private parseTags(rawTags: string): string[] {
    return rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}

const TASK_STATUSES = [
  'LATER',
  'NOW',
  'DONE',
  'TODO',
  'DOING',
  'CANCELLED',
  'IN-PROGRESS',
  'WAITING',
] as const;

function toIsoOrDate(dateValue: string, timeValue: string): string {
  if (!dateValue) {
    return '';
  }
  if (!timeValue) {
    return dateValue;
  }
  const iso = new Date(`${dateValue}T${timeValue}`).toJSON();
  return iso ?? dateValue;
}

function toCalendarDate(dateValue: string): Date {
  if (dateValue) {
    const [year, month, day] = dateValue.split('-').map((value) => Number(value));
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date();
}
