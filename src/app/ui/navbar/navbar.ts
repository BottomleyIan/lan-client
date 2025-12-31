import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NavLink } from '../nav-link/nav-link';
import { JournalEntryAddButton } from '../../features/notes/journal-entry-add-button/journal-entry-add-button';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [NavLink, JournalEntryAddButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly title = input<string>('LAN Music');
  readonly subtitle = input<string>('client');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth() + 1);
}
