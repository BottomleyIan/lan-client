import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type Signal,
} from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from '../../core/services/player-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Slider } from '../../ui/slider/slider';
import type { IconName } from '../../ui/icon/icon';
import { IconButtonPrimary } from '../../ui/icon-button/icon-button-primary';

@Component({
  selector: 'app-volume-controls',
  imports: [Slider, IconButtonPrimary],
  templateUrl: './volume-controls.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VolumeControls {
  private readonly player = inject(PlayerService);
  private readonly volume: Signal<number> = toSignal(this.player.volume$, { initialValue: 0.7 });
  private readonly lastAudibleVolume = signal(0.7);

  readonly volumePercent = computed(() => Math.round(this.volume() * 100));
  readonly isMuted = computed(() => this.volume() <= 0);
  readonly volumeIcon = computed<IconName>(() => {
    const volume = this.volume();
    if (volume === 0) {
      return 'volumeMute';
    }
    if (volume <= 0.33) {
      return 'volumeLow';
    }
    if (volume <= 0.66) {
      return 'volumeMedium';
    }
    return 'volumeHigh';
  });
  readonly muteLabel = computed(() => (this.isMuted() ? 'Restore volume' : 'Mute volume'));
  readonly volumeButtonClass = computed(
    () => 'text-tokyo-accent-cyan tokyo-glow-cyan-hover h-auto',
  );

  setVolumePercent(nextPercent: number): void {
    const clamped = Math.min(100, Math.max(0, nextPercent));
    const normalized = clamped / 100;
    if (normalized > 0) {
      this.lastAudibleVolume.set(normalized);
    }
    this.player.setVolume(normalized);
  }

  toggleMute(): void {
    if (this.isMuted()) {
      const restore = this.lastAudibleVolume();
      this.player.setVolume(restore > 0 ? restore : 0.7);
      return;
    }
    this.player.setVolume(0);
  }
}
