import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NOTES_NEW_CONFIG } from '../notes-new-page/notes-new-config';

@Component({
  selector: 'app-notes-page-add-notes-links',
  imports: [RouterLink],
  templateUrl: './notes-page-add-notes-links.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPageAddNotesLinks {
  protected todayLink(): string[] {
    const today = new Date();
    return [
      '/notes',
      String(today.getFullYear()),
      String(today.getMonth() + 1),
      String(today.getDate()),
    ];
  }

  protected noteTypes(): string[] {
    return Object.keys(NOTES_NEW_CONFIG).sort((a, b) => (a > b ? 1 : -1));
  }
}
