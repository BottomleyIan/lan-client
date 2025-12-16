import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ParamMap } from '@angular/router';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs';

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
  private readonly albumsApi = inject(AlbumsApi);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('letter1Ref') private letter1Selector?: LetterSelector;
  @ViewChild('letter2Ref') private letter2Selector?: LetterSelector;

  protected readonly albums$: Observable<AlbumCardModel[]> = this.route.queryParamMap.pipe(
    map((params) => this.startsWithValue(params)),
    distinctUntilChanged(),
    switchMap((startswith) => this.albumsApi.getAlbums(startswith ? { startswith } : undefined)),
    map((dto) => this.mapAlbums(dto)),
  );

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

  private startsWithValue(params: ParamMap): string | null {
    const letters = [params.get('letter1'), params.get('letter2')].filter(
      (value): value is string => !!value && value !== '*',
    );
    if (letters.length === 0) {
      return null;
    }
    return letters.join('').toLowerCase();
  }
}
