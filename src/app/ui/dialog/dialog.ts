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

  open(): void {
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.dialogEl().nativeElement.showModal();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.dialogEl().nativeElement.close();
  }

  protected handleClose(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  protected handleCancel(): void {
    this.cancelled.emit();
  }
}
