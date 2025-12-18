import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Icon, type IconName } from '../icon/icon';

@Component({
  selector: 'app-icon-button',
  imports: [Icon, NgClass],
  template: `
    <button
      type="button"
      class="inline-flex h-9 items-center justify-center gap-2 rounded-md px-2 transition focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      [ngClass]="buttonClass()"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      (click)="handleClick()"
    >
      <app-icon
        [name]="icon()"
        [colorVar]="null"
        [strokeWidth]="strokeWidth()"
        [ngClass]="iconClass()"
      />
      @if (text()) {
        <span class="text-sm leading-none font-semibold">{{ text() }}</span>
      }
      <span class="sr-only">{{ label() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButton {
  readonly icon = input<IconName>('settings');
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly strokeWidth = input<number>(1.8);
  readonly buttonClass = input<string>('text-red-500 hover:text-red-600');
  readonly iconClass = input<string | null>(null);
  readonly text = input<string | null>(null);
  readonly pressed = output<void>();

  handleClick(): void {
    if (this.disabled()) {
      return;
    }
    this.pressed.emit();
  }
}
