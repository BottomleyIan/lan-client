import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  imports: [],
  templateUrl: './panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Panel {
  readonly label = input<string>('Panel');
  readonly badge = input<string | null>('alpha');
  readonly meta = input<string | null>(null);

  protected readonly ariaLabel = computed(() => this.label());
}
