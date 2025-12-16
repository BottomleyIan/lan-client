import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './ui/navbar/navbar';
import { NavLink } from './ui/nav-link/nav-link';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NavLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('musicclient');
}
