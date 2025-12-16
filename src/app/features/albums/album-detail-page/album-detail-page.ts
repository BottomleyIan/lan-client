import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute } from '@angular/router';
import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';
import { albumImageUrl } from '../../../core/api/album-image';

type AlbumDetailVm = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './album-detail-page.html',
})
export class AlbumDetailPage {
  vm$: Observable<AlbumDetailVm>;

  constructor(
    private route: ActivatedRoute,
    private albumsApi: AlbumsApi,
  ) {
    this.vm$ = this.route.paramMap.pipe(
      map((p) => p.get('id')),
      filter((id): id is string => !!id),
      distinctUntilChanged(),
      switchMap((id) => this.albumsApi.getAlbum(id).pipe(map((a) => this.toVm(id, a)))),
    );
  }
  private toVm(id: string, a: HandlersAlbumDTO): AlbumDetailVm {
    return {
      id,
      title: String(a.title),
      artist: String(a.artist?.name ?? 'Unknown artist'),
      coverUrl: albumImageUrl(id),
    };
  }
}
