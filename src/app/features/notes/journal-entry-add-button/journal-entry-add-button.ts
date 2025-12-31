import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { JournalsApi } from '../../../core/api/journals.api';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { InputDirective } from '../../../ui/directives/input';

@Component({
  selector: 'app-journal-entry-add-button',
  imports: [AppDialog, ReactiveFormsModule, IconButtonPrimary, IconButtonDanger, InputDirective],
  templateUrl: './journal-entry-add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntryAddButton {
  private readonly journalsApi = inject(JournalsApi);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = viewChild.required<AppDialog>('dialog');

  protected readonly isSaving = signal(false);
  protected readonly entryStatuses = TASK_STATUSES;

  protected readonly form = this.fb.nonNullable.group({
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

  protected openDialog(): void {
    this.form.reset({ body: '', description: '', tags: '' });
    this.body.markAsUntouched();
    this.dialog().open();
  }

  protected closeDialog(): void {
    this.dialog().close();
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
    const scheduled = toIsoOrDate(
      this.form.controls.scheduledDate.value.trim(),
      this.form.controls.scheduledTime.value.trim(),
    );
    const deadline = toIsoOrDate(
      this.form.controls.deadlineDate.value.trim(),
      this.form.controls.deadlineTime.value.trim(),
    );

    this.isSaving.set(true);
    const request$ = this.journalsApi.createJournalEntry({
      body: trimmedBody,
      description: description || undefined,
      tags: tags.length ? tags : undefined,
      status: status || undefined,
      scheduled: scheduled || undefined,
      deadline: deadline || undefined,
    });

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => this.closeDialog(),
    });
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
