import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { NOTES_NEW_CONFIG } from '../notes-new-page/notes-new-config';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-journal-entry-add-button',
  imports: [IconButtonPrimary, TitleCasePipe],
  templateUrl: './journal-entry-add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './journal-entry-add-button.css',
})
export class JournalEntryAddButton {
  private readonly router = inject(Router);

  protected openNewEntry(): void {
    void this.router.navigate(['/notes/new']);
  }

  protected noteTypes(): string[] {
    return Object.keys(NOTES_NEW_CONFIG).sort((a, b) => (a > b ? 1 : -1));
  }
  protected noteLink(noteType: string): string {
    return `notes/new?type=${noteType}`;
  }
}
