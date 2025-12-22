import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';

import { toSignal } from '@angular/core/rxjs-interop';
import { Panel, type PanelAction } from '../../../ui/panel/panel';
import { PlaylistTracks } from '../playlist-tracks/playlist-tracks';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistsApi } from '../../../core/api/playlists.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistService } from '../../../core/services/playlist-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from '../../../core/services/player-facade';

type PlaylistVm = {
  id: string;
  title: string;
};

@Component({
  selector: 'app-playlist-detail',
  imports: [CommonModule, Panel, PlaylistTracks],
  templateUrl: './playlist-detail.html',
})
export class PlaylistDetail {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly playlistService = inject(PlaylistService);
  private readonly activePlaylistId = toSignal(this.playlistService.activePlaylistId$, {
    initialValue: null,
  });

  constructor(public player: PlayerFacade) {}

  readonly vm$: Observable<PlaylistVm | null> = this.playlistService.activePlaylistId$.pipe(
    switchMap((id) =>
      id == null
        ? of(null)
        : this.playlistsApi.getPlaylist(id).pipe(map((album) => this.toAlbumVm(String(id), album))),
    ),
  );

  private toAlbumVm(id: string, a: HandlersPlaylistDTO): PlaylistVm {
    return {
      id,
      title: a.name?.trim() || 'Untitled',
    };
  }
}
