import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialog {
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly labelledById = input<string | null>(null);
  readonly describedById = input<string | null>(null);

  readonly closed = output<void>();
  readonly cancelled = output<void>();

  protected readonly isOpen = signal(false);
  protected readonly backdropImage = signal('/bd-1.webp');

  open(): void {
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.backdropImage.set(pickBackdropImage());
    this.dialogEl().nativeElement.showModal();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.dialogEl().nativeElement.close();
  }

  protected handleBackdropClick(): void {
    this.close();
  }

  protected handleContentClick(event: Event): void {
    event.stopPropagation();
  }

  protected handleClose(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }
}

const BACKDROP_IMAGES = ['/bd-1.webp', '/bd-2.webp', '/bd-3.webp'] as const;

function pickBackdropImage(): string {
  const index = Math.floor(Math.random() * BACKDROP_IMAGES.length);
  return BACKDROP_IMAGES[index] ?? BACKDROP_IMAGES[0];
}
