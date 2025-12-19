import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavLink } from '../nav-link/nav-link';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [RouterOutlet, Navbar, NavLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly title = input<string>('LAN Music');
  readonly subtitle = input<string>('client');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth() + 1);
}
