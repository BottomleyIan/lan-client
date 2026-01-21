import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgxFlickeringGridComponent } from '@omnedia/ngx-flickering-grid';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  imports: [NgxFlickeringGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialog {
  private readonly dialogEl = viewChild.required<ElementRef<HTMLDialogElement>>('dialogEl');

  readonly labelledById = input<string | null>(null);
  readonly describedById = input<string | null>(null);

  readonly closed = output<void>();
  readonly cancelled = output<void>();

  protected readonly isOpen = signal(false);
  protected readonly backdropState = signal<'closed' | 'opening' | 'open' | 'closing'>('closed');

  open(): void {
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.backdropState.set('opening');
    this.dialogEl().nativeElement.showModal();
    requestAnimationFrame(() => {
      if (!this.isOpen()) return;
      this.backdropState.set('open');
    });
  }

  close(): void {
    if (!this.isOpen() || this.backdropState() === 'closing') return;
    this.backdropState.set('closing');
    window.setTimeout(() => {
      this.dialogEl().nativeElement.close();
    }, DIALOG_CLOSE_MS);
  }

  protected handleBackdropClick(): void {
    this.close();
  }

  protected handleContentClick(event: Event): void {
    event.stopPropagation();
  }

  protected handleClose(): void {
    this.isOpen.set(false);
    this.backdropState.set('closed');
    this.closed.emit();
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();
    this.close();
    this.cancelled.emit();
  }
}

const DIALOG_CLOSE_MS = 300;
