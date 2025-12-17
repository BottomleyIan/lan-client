import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './ui/navbar/navbar';
import { NavLink } from './ui/nav-link/nav-link';
import { Panel } from './ui/panel/panel';
import { CurrentlyPlaying } from './shared/currently-playing/currently-playing';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerEngineService } from './core/services/player-engine-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NavLink, Panel, CurrentlyPlaying],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('musicclient');
  constructor(_engine: PlayerEngineService) {}
}
