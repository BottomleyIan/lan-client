import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { map } from 'rxjs';
import type { Observable } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { CdkDropList, CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { HandlersPlaylistTrackDTO } from '../../../core/api/generated/api-types';
import { trackImageUrl } from '../../../core/api/track-image';
import { PlaylistTrack, type PlaylistTrackVm } from '../playlist-track/playlist-track';
import { PlaylistService } from '../../../core/services/playlist-service';

@Component({
  selector: 'app-playlist-service-tracks',
  imports: [CommonModule, NgOptimizedImage, ScrollingModule, CdkDropList, CdkDrag, PlaylistTrack],
  templateUrl: './playlist-service-tracks.html',
  styleUrl: './playlist-service-tracks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistServiceTracks {
  private readonly playlistService = inject(PlaylistService);

  readonly tracks$: Observable<PlaylistTrackVm[]> = this.playlistService.activePlaylistTracks$.pipe(
    map((tracks) => this.toTracksVm(tracks)),
  );

  protected trackByTrackId = (_: number, track: PlaylistTrackVm): string => track.id;

  protected removeTrack(track: PlaylistTrackVm): void {
    if (track.trackId === null) {
      return;
    }

    this.playlistService.removeTrack(track.trackId);
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
    this.playlistService.updateTrackPosition(track.trackId, event.currentIndex);
  }
}
