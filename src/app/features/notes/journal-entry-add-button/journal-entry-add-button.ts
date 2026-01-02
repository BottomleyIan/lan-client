import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';

@Component({
  selector: 'app-journal-entry-add-button',
  imports: [IconButtonPrimary],
  templateUrl: './journal-entry-add-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntryAddButton {
  private readonly router = inject(Router);

  protected openNewEntry(): void {
    void this.router.navigate(['/notes/new']);
  }
}
