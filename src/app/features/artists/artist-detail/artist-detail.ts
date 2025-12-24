import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HandlersArtistDTO } from '../../../core/api/generated/api-types';
import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { TracksList } from '../../tracks/tracks-list/tracks-list';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ArtistsApi } from '../../../core/api/artists.api';

type ArtistDetailVm = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-artist-detail',
  imports: [CommonModule, NgOptimizedImage, Panel, TracksList],
  templateUrl: './artist-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistDetail {
  private readonly artistsApi = inject(ArtistsApi);

  vm$: Observable<ArtistDetailVm | null>;

  readonly selectedArtistId = input<string | null>(null);
  readonly selectedArtistId$ = toObservable(this.selectedArtistId).pipe(distinctUntilChanged());
  readonly previous = input<(() => void) | null>(null);

  @ViewChild(TracksList) private tracksList?: TracksList;

  constructor() {
    this.vm$ = this.selectedArtistId$.pipe(
      switchMap((id) =>
        id
          ? this.artistsApi.getArtist(id).pipe(map((artist) => this.toArtistVm(id, artist)))
          : of(null),
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

  private toArtistVm(id: string, a: HandlersArtistDTO): ArtistDetailVm {
    return {
      id,
      name: a.name?.trim() || 'Untitled',
    };
  }
}
