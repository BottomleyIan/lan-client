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
  selector: 'app-notes-add-button',
  imports: [AppDialog, ReactiveFormsModule, IconButtonPrimary, IconButtonDanger, InputDirective],
  templateUrl: './notes-add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesAddButton {
  private readonly journalsApi = inject(JournalsApi);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = viewChild.required<AppDialog>('dialog');

  protected readonly isSaving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    body: ['', [Validators.required]],
    description: [''],
    tags: [''],
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

    this.isSaving.set(true);
    this.journalsApi
      .createJournalEntry({
        body: trimmedBody,
        description: description || undefined,
        tags: tags.length ? tags : undefined,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.closeDialog(),
      });
  }

  private parseTags(rawTags: string): string[] {
    return rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}
