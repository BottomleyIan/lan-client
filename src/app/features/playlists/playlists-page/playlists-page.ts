import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaylistsList } from '../playlists-list/playlists-list';
import { PlaylistDetail } from '../playlist-detail/playlist-detail';
import { PlaylistSwitcher } from '../playlist-switcher/playlist-switcher';

@Component({
  selector: 'app-playlists-page',
  imports: [PlaylistsList, PlaylistDetail, PlaylistSwitcher],
  templateUrl: './playlists-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPage {}
