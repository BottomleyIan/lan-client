import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import { ScrollingModule } from '@angular/cdk/scrolling';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';

import type { HandlersTrackDTO } from '../../../core/api/generated/api-types';

import { trackImageUrl } from '../../../core/api/track-image';
import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { TrackButton } from '../track-button/track-button';

type TrackDetailVm = {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  year?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-tracks-list',
  standalone: true,
  imports: [CommonModule, Panel, ScrollingModule, TrackButton],
  templateUrl: './tracks-list.html',
})
export class TracksList {
  tracksVm$: Observable<TrackDetailVm[]>;

  readonly albumId = input<string | null>(null);
  readonly albumId$ = toObservable(this.albumId).pipe(distinctUntilChanged());

  constructor(private albumsApi: AlbumsApi) {
    this.tracksVm$ = this.albumId$.pipe(
      switchMap((id) =>
        id
          ? this.albumsApi.getAlbumTracks(id).pipe(map((tracks) => this.toTracksVm(tracks)))
          : of([]),
      ),
    );
  }

  protected trackByTrackId = (_: number, track: TrackDetailVm): string => track.id;

  private toTracksVm(tracks: HandlersTrackDTO[]): TrackDetailVm[] {
    return tracks
      .filter((t): t is HandlersTrackDTO & { id: number } => typeof t.id === 'number')
      .map(
        (t): TrackDetailVm => ({
          id: String(t.id),
          title: t.title?.trim() || t.filename?.trim() || 'Untitled',
          artist: t.artist?.name?.trim() || undefined,
          genre: t.genre ?? undefined,
          year: String(t.year ?? ''),
          imageUrl: trackImageUrl(t.id),
        }),
      );
  }
}
