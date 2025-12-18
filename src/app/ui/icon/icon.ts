import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { icons, type IconName } from './icons';

@Component({
  selector: 'app-icon',
  template: `
    <i
      class="font-nerd block h-5 w-5 shrink-0 leading-none not-italic"
      aria-hidden="true"
      role="img"
      [attr.aria-label]="icon().label"
      [style.color]="iconColor()"
    >
      {{ icon().glyph }}
    </i>
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
