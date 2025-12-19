import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { H2Directive } from '../directives/h2';
import { ContainerDivDirective } from '../directives/container-div';
import { IconButtonPrimary } from '../icon-button/icon-button-primary';
import type { IconName } from '../icon/icon';

export type PanelAction = {
  icon: IconName;
  label: string;
  disabled?: boolean;
  onPress: () => void;
  buttonClass?: string | null;
  iconClass?: string | null;
  active?: boolean | null;
  activeClass?: string | null;
};

@Component({
  selector: 'app-panel',
  imports: [H2Directive, ContainerDivDirective, IconButtonPrimary],
  templateUrl: './panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel {
  readonly label = input<string>('Panel');
  readonly badge = input<string | null>(null);
  readonly meta = input<string | null>(null);
  readonly stableGutter = input(true);
  readonly hidden = input(false);
  readonly actions = input<PanelAction[]>([]);

  protected readonly ariaLabel = computed(() => this.label());
  protected readonly hasActions = computed(() => this.actions().length > 0);

  protected buttonClassFor(action: PanelAction): string {
    if (action.disabled) {
      return 'text-tokyo-text-muted';
    }
    return action.buttonClass ?? 'tokyo-glow-cyan-hover';
  }

  protected handleAction(action: PanelAction): void {
    action.onPress();
  }
}
