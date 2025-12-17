import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { IconButton } from '../../ui/icon-button/icon-button';

@Component({
  selector: 'app-currently-playing',
  imports: [IconButton],
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

  readonly position = signal(98);
  readonly isPlaying = signal(false);

  readonly progress = computed(() => {
    const duration = this.track().duration;
    if (duration <= 0) {
      return 0;
    }

    const clampedPosition = Math.min(Math.max(this.position(), 0), duration);
    return Math.round((clampedPosition / duration) * 100);
  });

  readonly playIcon = computed(() => (this.isPlaying() ? 'pause' : 'play'));
  readonly playLabel = computed(() => (this.isPlaying() ? 'Pause playback' : 'Play track'));
  readonly statusLabel = computed(() => (this.isPlaying() ? 'Playing' : 'Paused'));

  formatTime(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = (safeSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  togglePlayback(): void {
    this.isPlaying.update((playing) => !playing);
  }

  stopPlayback(): void {
    this.isPlaying.set(false);
    this.position.set(0);
  }

  skipPrevious(): void {
    this.position.set(0);
    this.isPlaying.set(true);
  }

  skipNext(): void {
    this.position.set(0);
    this.isPlaying.set(true);
  }
}
