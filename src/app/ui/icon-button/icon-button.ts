import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icon, type IconName } from '../icon/icon';

@Component({
  selector: 'app-icon-button',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition hover:text-rose-200 focus-visible:ring-2 focus-visible:ring-rose-400/80 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-slate-600 disabled:opacity-60"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      [attr.aria-disabled]="disabled()"
      [disabled]="disabled()"
      (click)="handleClick()"
    >
      <app-icon [name]="icon()" [colorVar]="iconColorVar()" [strokeWidth]="strokeWidth()" />
      <span class="sr-only">{{ label() }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButton {
  readonly icon = input<IconName>('settings');
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly iconColorVar = input<string | null>(null);
  readonly strokeWidth = input<number>(1.8);
  readonly pressed = output<void>();

  handleClick(): void {
    if (this.disabled()) {
      return;
    }
    this.pressed.emit();
  }
}
