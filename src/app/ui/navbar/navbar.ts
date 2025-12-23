import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NavLink } from '../nav-link/nav-link';
import { NotesAddButton } from '../../features/notes/notes-add-button/notes-add-button';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [NavLink, NotesAddButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly title = input<string>('LAN Music');
  readonly subtitle = input<string>('client');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth() + 1);
}
