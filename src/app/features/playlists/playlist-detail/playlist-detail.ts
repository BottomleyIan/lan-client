import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';

import { PlaylistServiceTracks } from '../playlist-service-tracks/playlist-service-tracks';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistsApi } from '../../../core/api/playlists.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistService } from '../../../core/services/playlist-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from '../../../core/services/player-facade';
import { ContainerDivDirective } from '../../../ui/directives/container-div';

type PlaylistVm = {
  id: string;
  title: string;
};

@Component({
  selector: 'app-playlist-detail',
  imports: [CommonModule, ContainerDivDirective, PlaylistServiceTracks],
  templateUrl: './playlist-detail.html',
})
export class PlaylistDetail {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly playlistService = inject(PlaylistService);

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
