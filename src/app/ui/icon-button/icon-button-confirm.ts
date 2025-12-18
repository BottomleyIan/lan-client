import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconButton } from './icon-button';
import type { IconName } from '../icon/icon';

const confirmClass =
  'text-darcula-accent-green hover:[text-shadow:0_0_12px_var(--color-darcula-accent-green)]';

@Component({
  selector: 'app-icon-button-confirm',
  imports: [IconButton],
  template: `
    <app-icon-button
      [icon]="icon()"
      [label]="label()"
      [disabled]="disabled()"
      [strokeWidth]="strokeWidth()"
      [buttonClass]="buttonClass()"
      [iconClass]="iconClass()"
      [text]="text()"
      (pressed)="pressed.emit()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonConfirm {
  readonly icon = input<IconName>('settings');
  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly strokeWidth = input<number>(1.8);
  readonly buttonClass = input<string>(confirmClass);
  readonly iconClass = input<string | null>(null);
  readonly text = input<string | null>(null);
  readonly pressed = output<void>();
}
