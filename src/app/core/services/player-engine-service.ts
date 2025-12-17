import { Injectable, DestroyRef, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from './player-service';
import { trackUrl } from '../api/track-url';

@Injectable({ providedIn: 'root' })
export class PlayerEngineService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly audio = new Audio();

  constructor(private player: PlayerService) {
    // When track or play state changes, apply to audio
    combineLatest([this.player.currentTrack$, this.player.isPlaying$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([track, isPlaying]) => {
        if (!track) {
          this.audio.pause();
          this.audio.src = '';
          return;
        }

        const url = trackUrl(track.id);
        if (this.audio.src !== url) {
          this.audio.src = url;
          this.audio.load();
        }

        if (isPlaying) void this.audio.play();
        else this.audio.pause();
      });

    // When track ends, go next
    this.audio.addEventListener('ended', () => this.player.next());
  }
}
