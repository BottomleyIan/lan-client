import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { BigButtonDirective } from '../../../ui/directives/big-button';

import { type PlayerServiceTrack } from '../../../core/services/player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from '../../../core/services/player-facade';
import { H2Directive } from '../../../ui/directives/h2';
import { Icon } from '../../../ui/icon/icon';
import { formatDurationMs } from '../../../shared/utils/time';
import { TrackOverview } from '../track-overview/track-overview';

@Component({
  selector: 'app-track-button',
  imports: [BigButtonDirective, H2Directive, Icon, TrackOverview],
  templateUrl: './track-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackButton {
  readonly track = input.required<PlayerServiceTrack>();
  readonly selected = input(false);
  readonly player = inject(PlayerFacade);

  protected readonly formattedDuration = computed(() => {
    const durationMs = this.track().durationMs ?? 0;
    return durationMs > 0 ? formatDurationMs(durationMs) : null;
  });
  protected readonly isWorking = signal(false);

  protected addToPlaylist(): void {
    if (this.isWorking()) return;
    const track = this.track();
    this.isWorking.set(true);
    this.player
      .enqueueToEnd$(track.id)
      .pipe(finalize(() => this.isWorking.set(false)))
      .subscribe();
  }
}
