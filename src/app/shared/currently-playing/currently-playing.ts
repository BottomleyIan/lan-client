import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
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
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TracksApi } from '../../core/api/tracks.api';
import { PlaybackSeek } from '../playback-seek/playback-seek';
import { NgxWordMorphComponent } from '@omnedia/ngx-word-morph';
import { NgxRetroGridComponent } from '@omnedia/ngx-retro-grid';

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
    PlaybackSeek,
    NgxWordMorphComponent,
    NgxRetroGridComponent,
  ],
  templateUrl: './currently-playing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrentlyPlaying {
  readonly imageFailed = signal(false);

  onImageError(): void {
    this.imageFailed.set(true);
  }

  readonly player = inject(PlayerService);
  private readonly tracksApi = inject(TracksApi);
  readonly current$: Observable<PlayerServiceTrack | null> = this.player.currentTrack$;
  private readonly isPlaying: Signal<boolean> = toSignal(this.player.isPlaying$, {
    initialValue: false,
  });
  readonly isShuffle: Signal<boolean> = toSignal(this.player.shuffle$, { initialValue: false });
  private readonly currentTrack: Signal<PlayerServiceTrack | null> = toSignal(this.current$, {
    initialValue: null,
  });

  constructor() {
    effect(
      () => {
        this.currentTrack();
        this.imageFailed.set(false);
      },
      { allowSignalWrites: true },
    );
  }

  readonly playIcon = computed(() => (this.isPlaying() ? 'pause' : 'play'));

  readonly playLabel = computed(() => (this.isPlaying() ? 'Pause playback' : 'Play track'));
  readonly shuffleLabel = computed(() => (this.isShuffle() ? 'Disable shuffle' : 'Enable shuffle'));

  readonly statusLabel = computed(() => (this.isPlaying() ? 'Playing' : 'Paused'));

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
