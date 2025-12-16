import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { icons, type IconName } from './icons';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      class="block h-5 w-5 shrink-0"
      [attr.viewBox]="icon().viewBox"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      [style.color]="iconColor()"
    >
      @for (path of icon().paths; track path) {
        <path [attr.d]="path" stroke-linecap="round" stroke-linejoin="round" />
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input<IconName>('settings');
  readonly colorVar = input<string | null>(null);
  readonly strokeWidth = input<number>(1.6);

  protected readonly icon = computed(() => icons[this.name()]);

  protected readonly iconColor = computed(() => {
    const colorVar = this.colorVar();
    return colorVar ? `var(${colorVar})` : 'currentColor';
  });
}

export type { IconName };
