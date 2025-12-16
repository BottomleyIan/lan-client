import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';
import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';
import { AlbumCard, type AlbumCardModel } from '../../../shared/album-card/album-card';
import { albumImageUrl } from '../../../core/api/album-image';

@Component({
  selector: 'app-albums-page',
  imports: [CommonModule, AlbumCard, RouterLink],
  templateUrl: './albums-page.html',
  styleUrl: './albums-page.css',
})
export class AlbumsPage {
  albums$: Observable<AlbumCardModel[]>;

  constructor(private albumsApi: AlbumsApi) {
    this.albums$ = this.albumsApi.getAlbums().pipe(map((dto) => this.mapAlbums(dto)));
  }
  private mapAlbums(items: HandlersAlbumDTO[]): AlbumCardModel[] {
    return items.map((a) => ({
      id: String(a.id),
      title: String(a.title),
      artist: String(a.artist?.name || 'Unknown artist'),
      coverUrl: a.id || a.id == 0 ? albumImageUrl(a.id) : undefined,
    }));
  }
}
