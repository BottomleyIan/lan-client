import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';

import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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

  readonly selectedPlaylistId = input.required<string>();
  readonly selectedPlaylistId$ = toObservable(this.selectedPlaylistId).pipe(distinctUntilChanged());

  readonly vm$: Observable<PlaylistVm | null> = this.selectedPlaylistId$.pipe(
    switchMap((id) =>
      id
        ? this.playlistsApi.getPlaylist(id).pipe(map((album) => this.toAlbumVm(id, album)))
        : of(null),
    ),
  );

  private toAlbumVm(id: string, a: HandlersPlaylistDTO): PlaylistVm {
    return {
      id,
      title: a.name?.trim() || 'Untitled',
    };
  }

  panelActions(vm: PlaylistVm): PanelAction[] {
    const playlistId = Number(vm.id);
    const isValidId = Number.isFinite(playlistId);
    const isProtected = isValidId && playlistId === 1;
    const isActive = isValidId && this.activePlaylistId() === playlistId;
    return [
      {
        icon: 'play',
        label: 'Play playlist',
        disabled: isActive,
        onPress: () => this.playPlaylist(playlistId),
      },
      {
        icon: 'trash',
        label: 'Delete playlist',
        disabled: isProtected,
        onPress: () => this.confirmDeletePlaylist(playlistId),
      },
    ];
  }

  private playPlaylist(playlistId: number): void {
    if (!Number.isFinite(playlistId)) {
      return;
    }
    this.player.setPlaylistAndPlay$(playlistId).subscribe({ error: console.error });
  }

  private confirmDeletePlaylist(playlistId: number): void {
    if (!Number.isFinite(playlistId)) {
      return;
    }
    window.alert(`Delete playlist ${playlistId} is not implemented yet.`);
  }
}
