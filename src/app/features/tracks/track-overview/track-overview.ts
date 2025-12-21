import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { H2Directive } from '../../../ui/directives/h2';
import { Icon } from '../../../ui/icon/icon';
import { formatDurationMs } from '../../../shared/utils/time';

@Component({
  selector: 'app-track-overview',
  imports: [H2Directive, Icon],
  templateUrl: './track-overview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackOverview {
  readonly title = input.required<string>();
  readonly artist = input.required<string>();
  readonly selected = input.required<boolean>();
  readonly durationMs = input<number>();
  readonly rating = input.required<number>();
  readonly year = input<string>();

  protected readonly formattedDuration = computed(() => {
    const durationMs = this.durationMs() ?? 0;
    return durationMs > 0 ? formatDurationMs(durationMs) : null;
  });
}
