import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Panel } from '../../../ui/panel/panel';

@Component({
  selector: 'app-playlists-page',
  imports: [Panel],
  templateUrl: './playlists-page.html',
  styleUrl: './playlists-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistsPage {}
