import { ChangeDetectionStrategy, Component, computed, type Signal } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from '../../core/services/player-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconButtonPrimary } from '../../ui/icon-button/icon-button-primary';

@Component({
  selector: 'app-volume-controls',
  imports: [IconButtonPrimary],
  templateUrl: './volume-controls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeControls {
  private readonly volume: Signal<number>;

  readonly volumePercent = computed(() => Math.round(this.volume() * 100));

  constructor(public player: PlayerService) {
    this.volume = toSignal(this.player.volume$, { initialValue: 0.7 });
  }

  handleIncrease(): void {
    this.player.volumeUp();
  }

  handleDecrease(): void {
    this.player.volumeDown();
  }
}
