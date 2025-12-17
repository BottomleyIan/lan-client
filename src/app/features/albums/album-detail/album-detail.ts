import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';

import type { HandlersAlbumDTO, HandlersTrackDTO } from '../../../core/api/generated/api-types';

import { albumImageUrl } from '../../../core/api/album-image';
import { trackImageUrl } from '../../../core/api/track-image';
import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';

type AlbumDetailVm = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  coverUrl?: string;
};

type TrackDetailVm = {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  year?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, Panel],
  templateUrl: './album-detail.html',
})
export class AlbumDetail {
  vm$: Observable<AlbumDetailVm | null>;
  tracksVm$: Observable<TrackDetailVm[]>;

  readonly selectedAlbumId = input<string | null>(null);
  readonly selectedAlbumId$ = toObservable(this.selectedAlbumId).pipe(distinctUntilChanged());

  constructor(private albumsApi: AlbumsApi) {
    this.vm$ = this.selectedAlbumId$.pipe(
      switchMap((id) =>
        id ? this.albumsApi.getAlbum(id).pipe(map((album) => this.toAlbumVm(id, album))) : of(null),
      ),
    );

    this.tracksVm$ = this.selectedAlbumId$.pipe(
      switchMap((id) =>
        id
          ? this.albumsApi.getAlbumTracks(id).pipe(map((tracks) => this.toTracksVm(tracks)))
          : of([]),
      ),
    );
  }

  private toAlbumVm(id: string, a: HandlersAlbumDTO): AlbumDetailVm {
    return {
      id,
      title: a.title?.trim() || 'Untitled',
      artist: a.artist?.name?.trim() || 'Unknown artist',
      coverUrl: albumImageUrl(id),
    };
  }

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
