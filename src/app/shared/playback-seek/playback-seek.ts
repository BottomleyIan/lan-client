import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Slider } from '../../ui/slider/slider';
import { formatDurationMs } from '../utils/time';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService, type PlayerServiceTrack } from '../../core/services/player-service';

@Component({
  selector: 'app-playback-seek',
  imports: [Slider],
  templateUrl: './playback-seek.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaybackSeek {
  private readonly player = inject(PlayerService);
  private readonly currentTrack = toSignal<PlayerServiceTrack | null>(this.player.currentTrack$, {
    initialValue: null,
  });
  protected readonly positionMs = toSignal(this.player.positionMs$, { initialValue: 0 });

  readonly label = input<string>('Playback position');

  protected readonly formattedCurrentTime = computed(() => formatDurationMs(this.positionMs()));
  protected readonly durationMs = computed(() => this.currentTrack()?.durationMs ?? 0);
  protected readonly formattedDuration = computed(() => formatDurationMs(this.durationMs()));
  protected readonly isSeekDisabled = computed(() => this.durationMs() <= 0);

  protected handleSeek(nextTimeMs: number): void {
    this.player.seek(nextTimeMs);
  }
}
