import { ChangeDetectionStrategy, Component, computed, signal, type Signal } from '@angular/core';
import { Panel } from '../../ui/panel/panel';
import { IconButton } from '../../ui/icon-button/icon-button';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService, type PlayerServiceTrack } from '../../core/services/player-service';
import type { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { EqualizerDisplay } from '../equalizer-display/equalizer-display';

@Component({
  selector: 'app-currently-playing',
  imports: [Panel, IconButton, AsyncPipe, EqualizerDisplay],
  templateUrl: './currently-playing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentlyPlaying {
  readonly track = signal({
    title: 'Song 1',
    artist: 'Unknown Artist',
    time: '12:24',
    duration: 245,
  });

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }

  readonly position = signal(98);
  current$: Observable<PlayerServiceTrack | null>;
  private readonly isPlaying: Signal<boolean>;
  private readonly volume: Signal<number>;

  constructor(public player: PlayerService) {
    this.current$ = this.player.currentTrack$;
    this.isPlaying = toSignal(this.player.isPlaying$, { initialValue: false });
    this.volume = toSignal(this.player.volume$, { initialValue: 0.7 });
  }

  readonly playIcon = computed(() => (this.isPlaying() ? 'pause' : 'play'));

  readonly playLabel = computed(() => (this.isPlaying() ? 'Pause playback' : 'Play track'));

  readonly statusLabel = computed(() => (this.isPlaying() ? 'Playing' : 'Paused'));
  readonly volumePercent = computed(() => Math.round(this.volume() * 100));
  formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  togglePlayback(): void {
    if (this.isPlaying()) {
      this.player.pause();
    } else {
      this.player.play();
    }
  }

  volumeUp(): void {
    this.player.volumeUp();
  }

  volumeDown(): void {
    this.player.volumeDown();
  }
}
