import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { combineLatest, map, shareReplay, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { AlbumsApi } from '../../../core/api/albums.api';
import { albumImageUrl } from '../../../core/api/album-image';
import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';
import { AlbumButton, type AlbumButtonModel } from '../album-button/album-button';

@Component({
  selector: 'app-albums-list',
  imports: [CommonModule, Panel, ScrollingModule, AlbumButton],
  templateUrl: './albums-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsList {
  private readonly albumsApi = inject(AlbumsApi);

  readonly letters = input<string>('');
  readonly selectedAlbumId = input<string | null>(null);
  readonly onAlbumSelected = input<(albumId: string) => void>(() => {});

  private readonly allAlbums$ = this.albumsApi.getAlbums().pipe(
    map((dto) => this.mapAlbums(dto)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private readonly filterPrefix = computed(() => this.letters().trim().toLowerCase());

  protected readonly albums$ = combineLatest([
    this.allAlbums$,
    toObservable(this.filterPrefix).pipe(startWith(this.filterPrefix())),
  ]).pipe(
    map(([albums, startswith]) => {
      if (!startswith) return albums;
      return albums.filter((a) => {
        const lower = (a.title ?? '').toLowerCase();
        if (lower.startsWith('the ')) {
          return lower.startsWith(`the ${startswith}`);
        }
        return lower.startsWith(startswith);
      });
    }),
  );

  protected trackByAlbumId = (_: number, album: AlbumButtonModel): string => album.id;

  protected handleAlbumSelected(albumId: string): void {
    this.onAlbumSelected()(albumId);
  }

  private mapAlbums(items: HandlersAlbumDTO[]): AlbumButtonModel[] {
    return items.map((a) => ({
      id: String(a.id),
      title: String(a.title),
      artist: String(a.artist?.name || 'Unknown artist'),
      coverUrl: a.id || a.id == 0 ? albumImageUrl(a.id) : undefined,
    }));
  }
}
