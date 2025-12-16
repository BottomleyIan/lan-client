import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';
import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';
import { AlbumCard, type AlbumCardModel } from '../../../shared/album-card/album-card';
import { albumImageUrl } from '../../../core/api/album-image';
import { Panel } from '../../../ui/panel/panel';
import { LetterSelector } from '../../../ui/letter-selector/letter-selector';

@Component({
  selector: 'app-albums-page',
  imports: [CommonModule, AlbumCard, RouterLink, Panel, LetterSelector],
  templateUrl: './albums-page.html',
  styleUrl: './albums-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsPage {
  @ViewChild('letter1Ref') private letter1Selector?: LetterSelector;
  @ViewChild('letter2Ref') private letter2Selector?: LetterSelector;
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

  protected focusLetter1 = (): void => {
    this.letter1Selector?.focus();
  };

  protected focusLetter2 = (): void => {
    this.letter2Selector?.focus();
  };
}
