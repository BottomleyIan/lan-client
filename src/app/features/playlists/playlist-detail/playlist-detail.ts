import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';

import { toObservable } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { PlaylistTracks } from '../playlist-tracks/playlist-tracks';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistsApi } from '../../../core/api/playlists.api';

type PlaylistVm = {
  id: string;
  title: string;
};

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, Panel, PlaylistTracks],
  templateUrl: './playlist-detail.html',
})
export class PlaylistDetail {
  vm$: Observable<PlaylistVm | null>;

  readonly selectedPlaylistId = input.required<string>();
  readonly selectedPlaylistId$ = toObservable(this.selectedPlaylistId).pipe(distinctUntilChanged());

  constructor(private playlistsApi: PlaylistsApi) {
    this.vm$ = this.selectedPlaylistId$.pipe(
      switchMap((id) =>
        id
          ? this.playlistsApi.getPlaylist(id).pipe(map((album) => this.toAlbumVm(id, album)))
          : of(null),
      ),
    );
  }

  private toAlbumVm(id: string, a: HandlersPlaylistDTO): PlaylistVm {
    return {
      id,
      title: a.name?.trim() || 'Untitled',
    };
  }
}
