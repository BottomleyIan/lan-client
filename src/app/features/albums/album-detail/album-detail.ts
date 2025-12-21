import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AlbumsApi } from '../../../core/api/albums.api';

import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';

import { albumImageUrl } from '../../../core/api/album-image';
import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { TracksList } from '../../tracks/tracks-list/tracks-list';

type AlbumDetailVm = {
  id: string;
  title: string;
  artist: string;
  year?: string;
  coverUrl?: string;
};

@Component({
  selector: 'app-album-detail',
  imports: [CommonModule, NgOptimizedImage, Panel, TracksList],
  templateUrl: './album-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumDetail {
  private readonly albumsApi = inject(AlbumsApi);

  vm$: Observable<AlbumDetailVm | null>;

  readonly selectedAlbumId = input<string | null>(null);
  readonly selectedAlbumId$ = toObservable(this.selectedAlbumId).pipe(distinctUntilChanged());
  readonly previous = input<(() => void) | null>(null);

  @ViewChild(TracksList) private tracksList?: TracksList;

  constructor() {
    this.vm$ = this.selectedAlbumId$.pipe(
      switchMap((id) =>
        id ? this.albumsApi.getAlbum(id).pipe(map((album) => this.toAlbumVm(id, album))) : of(null),
      ),
    );
  }

  focusTracks(): void {
    if (this.tracksList) {
      this.tracksList.focusFirstTrack();
      return;
    }
    queueMicrotask(() => this.tracksList?.focusFirstTrack());
  }

  private toAlbumVm(id: string, a: HandlersAlbumDTO): AlbumDetailVm {
    return {
      id,
      title: a.title?.trim() || 'Untitled',
      artist: a.artist?.name?.trim() || 'Unknown artist',
      coverUrl: albumImageUrl(id),
    };
  }
}
