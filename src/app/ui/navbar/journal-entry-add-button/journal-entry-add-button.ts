import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NOTES_NEW_CONFIG } from '../../../features/notes/notes-new-page/notes-new-config';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenu, NavDropdownMenuNavItems } from '../nav-dropdown-menu/nav-dropdown-menu';

@Component({
  selector: 'app-journal-entry-add-button',
  imports: [NavDropdownMenu],
  templateUrl: './journal-entry-add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntryAddButton {
  protected navItems(): NavDropdownMenuNavItems[] {
    return [
      { name: 'Notes', url: 'notes' },
      { name: 'New Note', url: 'notes/new' },
      ...this.noteTypes().map((t) => ({ name: t, url: this.noteLink(t) })),
    ];
  }
  protected noteTypes(): string[] {
    return Object.keys(NOTES_NEW_CONFIG).sort((a, b) => (a > b ? 1 : -1));
  }
  protected noteLink(noteType: string): string {
    return `notes/new?type=${noteType}`;
  }
}
