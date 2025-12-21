import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PlaylistDetail } from '../playlist-detail/playlist-detail';
import { PlaylistSwitcher } from '../playlist-switcher/playlist-switcher';

@Component({
  selector: 'app-playlists-page',
  imports: [PlaylistDetail, PlaylistSwitcher],
  templateUrl: './playlists-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPage {}
