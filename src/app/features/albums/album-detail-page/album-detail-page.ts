import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';

import type { HandlersAlbumDTO, HandlersTrackDTO } from '../../../core/api/generated/api-types';

import { albumImageUrl } from '../../../core/api/album-image';
import { trackImageUrl } from '../../../core/api/track-image';

type AlbumDetailVm = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
};

type TrackDetailVm = {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  year?: number;
  imageUrl?: string;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-detail-page.html',
})
export class AlbumDetailPage {
  vm$: Observable<AlbumDetailVm>;
  tracksVm$: Observable<TrackDetailVm[]>;

  constructor(
    private route: ActivatedRoute,
    private albumsApi: AlbumsApi,
  ) {
    const id$ = this.route.paramMap.pipe(
      map((p) => p.get('id')),
      filter((id): id is string => !!id),
      distinctUntilChanged(),
    );

    this.vm$ = id$.pipe(
      switchMap((id) =>
        this.albumsApi.getAlbum(id).pipe(map((album) => this.toAlbumVm(id, album))),
      ),
    );

    this.tracksVm$ = id$.pipe(
      switchMap((id) =>
        this.albumsApi.getAlbumTracks(id).pipe(map((tracks) => this.toTracksVm(tracks))),
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
          year: typeof t.year === 'number' ? t.year : undefined,
          imageUrl: trackImageUrl(t.id),
        }),
      );
  }
}
