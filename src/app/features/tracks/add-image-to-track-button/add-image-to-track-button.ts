import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TracksApi } from '../../../core/api/tracks.api';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { InputDirective } from '../../../ui/directives/input';

@Component({
  selector: 'app-add-image-to-track-button',
  standalone: true,
  imports: [ReactiveFormsModule, IconButtonPrimary, IconButtonDanger, InputDirective],
  templateUrl: './add-image-to-track-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddImageToTrackButto {
  private readonly tracksApi = inject(TracksApi);
  private readonly fb = inject(FormBuilder);

  readonly trackId = input.required<number | string>();
  readonly trackTitle = input<string>('');

  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  protected readonly isSaving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    url: ['', [Validators.required]],
  });

  protected get url(): FormControl<string> {
    return this.form.controls.url;
  }

  protected openDialog(): void {
    this.form.reset({ url: '' });
    this.url.markAsUntouched();
    this.dialogEl().nativeElement.showModal();
  }

  protected closeDialog(): void {
    this.dialogEl().nativeElement.close();
  }

  protected accept(): void {
    console.log(this.url.value);
    const trimmedUrl = this.url.value.trim();
    this.url.setValue(trimmedUrl);

    if (!trimmedUrl) {
      this.url.markAsTouched();
      return;
    }
    console.log(trimmedUrl);
    if (this.isSaving()) return;

    this.isSaving.set(true);

    this.tracksApi
      .updateTrackImage(this.trackId(), { url: trimmedUrl })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => this.closeDialog(),
      });
  }
}
