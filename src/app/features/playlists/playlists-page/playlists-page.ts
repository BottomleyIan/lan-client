import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Panel } from '../../../ui/panel/panel';
import { PlaylistsList } from '../playlists-list/playlists-list';
import { PlaylistDetail } from '../playlist-detail/playlist-detail';

@Component({
  selector: 'app-playlists-page',
  imports: [Panel, PlaylistsList, PlaylistDetail],
  templateUrl: './playlists-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPage {
  protected readonly selectedPlaylistId = signal<string | null>(null);

  protected handlePlaylistSelected = (playlistId: string): void => {
    this.selectedPlaylistId.set(playlistId);
  };
}
