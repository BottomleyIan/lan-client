import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { H2Directive } from '../directives/h2';

@Component({
  selector: 'app-panel',
  imports: [H2Directive],
  templateUrl: './panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel {
  readonly label = input<string>('Panel');
  readonly badge = input<string | null>(null);
  readonly meta = input<string | null>(null);

  protected readonly ariaLabel = computed(() => this.label());
}
