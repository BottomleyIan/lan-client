import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { distinctUntilChanged, map, of, startWith, Subject, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';
import { toObservable } from '@angular/core/rxjs-interop';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistsApi } from '../../../core/api/playlists.api';
import type { HandlersPlaylistTrackDTO } from '../../../core/api/generated/api-types';
import { trackImageUrl } from '../../../core/api/track-image';
import { PlaylistTrack, type PlaylistTrackVm } from '../playlist-track/playlist-track';
import { PlaylistService } from '../../../core/services/playlist-service';

@Component({
  selector: 'app-playlist-tracks',
  imports: [CommonModule, NgOptimizedImage, ScrollingModule, CdkDropList, CdkDrag, PlaylistTrack],
  templateUrl: './playlist-tracks.html',
  styleUrl: './playlist-tracks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistTracks {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly playlistService = inject(PlaylistService);
  private readonly refresh$ = new Subject<void>();

  readonly playlistId = input.required<string>();
  readonly playlistId$ = toObservable(this.playlistId).pipe(distinctUntilChanged());

  readonly tracks$: Observable<PlaylistTrackVm[]> = this.playlistId$.pipe(
    switchMap((playlistId) =>
      playlistId
        ? this.refresh$.pipe(
            startWith(void 0),
            switchMap(() =>
              this.playlistsApi
                .getPlaylistTracks(playlistId)
                .pipe(map((tracks) => this.toTracksVm(tracks))),
            ),
          )
        : of([]),
    ),
  );

  protected trackByTrackId = (_: number, track: PlaylistTrackVm): string => track.id;

  protected removeTrack(playlistId: string, track: PlaylistTrackVm): void {
    if (track.trackId === null) {
      return;
    }

    this.playlistsApi.deletePlaylistTrack(playlistId, track.trackId).subscribe(() => {
      this.refresh$.next();
    });
  }

  private toTracksVm(tracks: HandlersPlaylistTrackDTO[]): PlaylistTrackVm[] {
    return tracks.map((playlistTrack) => {
      const track = playlistTrack.track;
      const title = track?.title?.trim() || track?.filename?.trim() || 'Untitled';
      const trackId = track?.id ?? playlistTrack.track_id ?? null;
      return {
        id: String(playlistTrack.id ?? title),
        trackId: trackId ?? null,
        title,
        artist: track?.artist?.name?.trim() || undefined,
        year: track?.year !== undefined ? String(track.year) : undefined,
        imageUrl: trackId !== null ? trackImageUrl(trackId) : undefined,
        rating: track?.rating ?? 0,
        durationMs: (track?.duration_seconds ?? 0) * 1000,
      };
    });
  }

  drop(event: CdkDragDrop<PlaylistTrackVm[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const track = event.item.data;
    if (!track || track.trackId === null) {
      return;
    }

    this.playlistsApi
      .updatePlaylistTrack(this.playlistId(), track.trackId, { position: event.currentIndex })
      .subscribe({
        next: () => {
          this.refresh$.next();
          this.playlistService.refreshTracks();
        },
        error: (err) => console.error(err),
      });
  }
}
