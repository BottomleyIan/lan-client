import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type IconName = 'settings';

type IconDefinition = {
  readonly viewBox: string;
  readonly paths: readonly string[];
};

const ICONS: Record<IconName, IconDefinition> = {
  settings: {
    viewBox: '0 0 24 24',
    paths: [
      'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.65.87.03.016.06.033.09.05l1.12.561c.495.248.723.84.508 1.356l-.498 1.246a1.125 1.125 0 0 0 .285 1.234l.93.929c.39.389.44 1.002.118 1.45l-.498.684a1.125 1.125 0 0 1-1.27.38l-1.21-.404a1.125 1.125 0 0 0-1.02.17l-.268.201a1.125 1.125 0 0 0-.45.9v1.332c0 .52-.355.966-.86 1.09l-1.518.38c-.52.13-1.06-.184-1.17-.714l-.259-1.296a1.125 1.125 0 0 0-.641-.828l-1.233-.493a1.125 1.125 0 0 1-.681-1.105l.06-1.35a1.125 1.125 0 0 0-.188-.7l-.732-1.1a1.125 1.125 0 0 1 .106-1.41l.976-.976c.249-.249.38-.595.36-.949l-.07-1.234c-.03-.52.35-.978.868-1.05l1.334-.178c.378-.05.704-.29.868-.638l.945-1.89Z',
      'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    ],
  },
};

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

  protected readonly icon = computed(() => ICONS[this.name()]);

  protected readonly iconColor = computed(() => {
    const colorVar = this.colorVar();
    return colorVar ? `var(${colorVar})` : 'currentColor';
  });
}

export type { IconName };
