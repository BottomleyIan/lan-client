import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  signal,
  type Signal,
} from '@angular/core';
import { Panel } from '../../ui/panel/panel';
import { IconButtonPrimary } from '../../ui/icon-button/icon-button-primary';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService, type PlayerServiceTrack } from '../../core/services/player-service';
import { type Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { EqualizerDisplay } from '../equalizer-display/equalizer-display';
import { VolumeControls } from '../volume-controls/volume-controls';
import { H2Directive } from '../../ui/directives/h2';
import { ContainerDivDirective } from '../../ui/directives/container-div';
import { AddImageToTrackButto } from '../../features/tracks/add-image-to-track-button/add-image-to-track-button';
import { StarRating } from '../star-rating/star-rating';
import type { TracksApi } from '../../core/api/tracks.api';

@Component({
  selector: 'app-currently-playing',
  imports: [
    Panel,
    IconButtonPrimary,
    AsyncPipe,
    H2Directive,
    EqualizerDisplay,
    ContainerDivDirective,
    VolumeControls,
    AddImageToTrackButto,
    StarRating,
  ],
  templateUrl: './currently-playing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentlyPlaying {
  readonly imageFailed = signal(false);

  onImageError(): void {
    this.imageFailed.set(true);
  }

  readonly position = signal(98);
  readonly current$: Observable<PlayerServiceTrack | null>;
  private readonly isPlaying: Signal<boolean>;
  readonly isShuffle: Signal<boolean>;
  private readonly currentTrack: Signal<PlayerServiceTrack | null>;
  private readonly tracksApi: TracksApi;

  constructor(
    public player: PlayerService,
    tracksApi: TracksApi,
  ) {
    this.current$ = this.player.currentTrack$;
    this.isPlaying = toSignal(this.player.isPlaying$, { initialValue: false });
    this.isShuffle = toSignal(this.player.shuffle$, { initialValue: false });
    this.currentTrack = toSignal(this.current$, { initialValue: null });
    effect(
      () => {
        this.currentTrack();
        this.imageFailed.set(false);
      },
      { allowSignalWrites: true },
    );
    this.tracksApi = tracksApi;
  }

  readonly playIcon = computed(() => (this.isPlaying() ? 'pause' : 'play'));

  readonly playLabel = computed(() => (this.isPlaying() ? 'Pause playback' : 'Play track'));
  readonly shuffleLabel = computed(() => (this.isShuffle() ? 'Disable shuffle' : 'Enable shuffle'));

  readonly statusLabel = computed(() => (this.isPlaying() ? 'Playing' : 'Paused'));
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

  toggleShuffle(): void {
    this.player.toggleShuffle();
  }

  makeHandleRatingChange(trackId: string | number): (r: number) => void {
    return (_rating: number): void => {
      this.tracksApi.updateTrackRating(trackId, { rating: _rating }).subscribe({
        next: (resp) => {
          this.player.updateTrackInQueue(trackId.toString(), { rating: resp.rating });
        },
        error: (err) => console.error(err),
      });
    };
  }
}
