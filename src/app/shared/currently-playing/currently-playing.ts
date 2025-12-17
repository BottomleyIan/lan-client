import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IconButton } from '../../ui/icon-button/icon-button';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService, type PlayerServiceTrack } from '../../core/services/player-service';
import type { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-currently-playing',
  imports: [IconButton, AsyncPipe],
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
  readonly isPlaying = signal(false);
  current$: Observable<PlayerServiceTrack | null>;
  isPlaying$: Observable<boolean>;

  constructor(public player: PlayerService) {
    this.current$ = this.player.currentTrack$;
    this.isPlaying$ = this.player.isPlaying$;
  }

  readonly playIcon = computed(() => (this.isPlaying() ? 'pause' : 'play'));

  readonly playLabel = computed(() => (this.isPlaying() ? 'Pause playback' : 'Play track'));

  readonly statusLabel = computed(() => (this.isPlaying() ? 'Playing' : 'Paused'));
  formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }
}
