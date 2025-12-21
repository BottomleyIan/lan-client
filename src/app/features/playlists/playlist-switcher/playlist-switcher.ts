import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { shareReplay, startWith, switchMap } from 'rxjs';
import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';
import { PlaylistsApi } from '../../../core/api/playlists.api';
import { PlaylistService } from '../../../core/services/playlist-service';
import { PlayerFacade } from '../../../core/services/player-facade';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { CreatePlaylistForm } from '../create-playlist-form/create-playlist-form';
import { Panel } from '../../../ui/panel/panel';

type PlaylistOption = {
  id: number;
  name: string;
};

@Component({
  selector: 'app-playlist-switcher',
  imports: [AppDialog, IconButtonPrimary, IconButtonDanger, CreatePlaylistForm, Panel],
  templateUrl: './playlist-switcher.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistSwitcher {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly playlistService = inject(PlaylistService);
  private readonly player = inject(PlayerFacade);

  private readonly playlists$ = this.playlistService.refreshPlaylists$.pipe(
    startWith(void 0),
    switchMap(() => this.playlistsApi.getPlaylists()),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly playlists = toSignal(this.playlists$, {
    initialValue: [] as HandlersPlaylistDTO[],
  });
  private readonly activePlaylistId = toSignal(this.playlistService.activePlaylistId$, {
    initialValue: null,
  });
  private readonly dialog = viewChild.required<AppDialog>('dialog');
  private readonly form = viewChild.required<CreatePlaylistForm>(CreatePlaylistForm);

  protected readonly playlistOptions = computed<PlaylistOption[]>(() =>
    [...this.playlists()]
      .sort((a, b) => (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER))
      .map((playlist) => ({
        id: playlist.id ?? -1,
        name: playlist.name?.trim() || 'Untitled playlist',
      })),
  );

  protected readonly activeIndex = computed(() => {
    const activeId = this.activePlaylistId();
    if (activeId == null) {
      return -1;
    }
    return this.playlistOptions().findIndex((playlist) => playlist.id === activeId);
  });

  protected readonly activeName = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 ? this.playlistOptions()[idx].name : 'No playlist selected';
  });

  protected readonly hasPrevious = computed(() => this.activeIndex() > 0);
  protected readonly hasNext = computed(() => {
    const idx = this.activeIndex();
    return idx >= 0 && idx < this.playlistOptions().length - 1;
  });

  protected selectPrevious(): void {
    if (!this.hasPrevious()) {
      return;
    }
    const nextIndex = this.activeIndex() - 1;
    const playlist = this.playlistOptions()[nextIndex];
    if (playlist) {
      this.player.setPlaylistAndPlay$(playlist.id).subscribe({ error: console.error });
    }
  }

  protected selectNext(): void {
    if (!this.hasNext()) {
      return;
    }
    const nextIndex = this.activeIndex() + 1;
    const playlist = this.playlistOptions()[nextIndex];
    if (playlist) {
      this.player.setPlaylistAndPlay$(playlist.id).subscribe({ error: console.error });
    }
  }

  protected openDialog(): void {
    this.form().resetForm();
    this.dialog().open();
  }

  protected closeDialog(): void {
    this.dialog().close();
  }

  protected handlePlaylistCreated(playlist: HandlersPlaylistDTO): void {
    this.closeDialog();
    this.playlistService.refreshPlaylists();
    const playlistId = playlist.id;
    if (playlistId == null) {
      return;
    }
    this.player.setPlaylistAndPlay$(playlistId).subscribe({ error: console.error });
  }
}
