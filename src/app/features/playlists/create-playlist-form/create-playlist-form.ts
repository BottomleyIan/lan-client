import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PlaylistsApi } from '../../../core/api/playlists.api';
import { CancelButtonDirective } from '../../../ui/directives/cancel-button';
import { ConfirmButtonDirective } from '../../../ui/directives/confirm-button';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';

@Component({
  selector: 'app-create-playlist-form',
  imports: [
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    ConfirmButtonDirective,
    CancelButtonDirective,
  ],
  templateUrl: './create-playlist-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePlaylistForm {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly isCreating = signal(false);
  protected readonly createForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required]],
  });
  protected readonly nameControl = this.createForm.controls.name;

  readonly playlistCreated = output<void>();

  addPlaylist(): void {
    const trimmedName = this.nameControl.value.trim();
    this.nameControl.setValue(trimmedName);

    if (!trimmedName) {
      this.nameControl.markAsTouched();
      return;
    }

    if (this.isCreating()) {
      return;
    }

    this.isCreating.set(true);

    this.playlistsApi
      .createPlaylist({ name: trimmedName })
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
        }),
      )
      .subscribe(() => {
        this.createForm.reset({ name: '' });
        this.playlistCreated.emit();
      });
  }

  resetForm(): void {
    this.createForm.reset({ name: '' });
  }
}
