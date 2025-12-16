import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Panel } from '../../../ui/panel/panel';

@Component({
  selector: 'app-artists-page',
  imports: [Panel],
  templateUrl: './artists-page.html',
  styleUrl: './artists-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistsPage {}
