import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FoldersApi } from '../../../core/api/folders.api';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';
import { ConfirmButtonDirective } from '../../../ui/directives/confirm-button';
import { CancelButtonDirective } from '../../../ui/directives/cancel-button';

@Component({
  selector: 'app-add-folder-form',
  imports: [
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    ConfirmButtonDirective,
    CancelButtonDirective,
  ],
  template: `
    <form uiForm (ngSubmit)="addFolder()" [formGroup]="createForm">
      <div class="flex flex-col gap-2">
        <label class="text-sm font-semibold text-slate-100" for="folder-path">Add folder</label>
        <p class="text-xs text-slate-400">Enter a music folder path to include in the library.</p>
        <div class="flex flex-col gap-2 @sm:flex-row @sm:items-center">
          <input
            uiInput
            id="folder-path"
            name="folder-path"
            type="text"
            placeholder="/Users/you/Music"
            formControlName="path"
            [attr.aria-invalid]="pathControl.invalid && pathControl.touched ? true : null"
            [disabled]="isCreating()"
          />
          <div class="flex flex-col gap-2 @sm:flex-row @sm:items-center">
            <button uiConfirmButton type="submit" [disabled]="createForm.invalid || isCreating()">
              Add folder
            </button>
            <button
              uiCancelButton
              type="button"
              [disabled]="isCreating() || !pathControl.value"
              (click)="resetForm()"
            >
              Clear
            </button>
          </div>
        </div>
        @if (pathControl.invalid && pathControl.touched) {
          <p class="text-xs font-semibold text-rose-200">Folder path is required.</p>
        }
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFolderForm {
  private readonly foldersApi = inject(FoldersApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isCreating = signal(false);
  protected readonly createForm = this.formBuilder.nonNullable.group({
    path: ['', [Validators.required]],
  });
  protected readonly pathControl = this.createForm.controls.path;

  readonly folderCreated = output<void>();

  addFolder(): void {
    const trimmedPath = this.pathControl.value.trim();
    this.pathControl.setValue(trimmedPath);

    if (!trimmedPath) {
      this.pathControl.markAsTouched();
      return;
    }

    if (this.isCreating()) {
      return;
    }

    this.isCreating.set(true);

    this.foldersApi
      .createFolder({ path: trimmedPath })
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
        }),
      )
      .subscribe(() => {
        this.createForm.reset({ path: '' });
        this.folderCreated.emit();
      });
  }

  resetForm(): void {
    this.createForm.reset({ path: '' });
  }
}
