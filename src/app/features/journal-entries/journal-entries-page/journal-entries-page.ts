import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalsApi } from '../../../core/api/journals.api';
import { Panel } from '../../../ui/panel/panel';
import { JournalEntry } from '../journal-entry/journal-entry';

@Component({
  selector: 'app-journal-entries-page',
  imports: [CommonModule, Panel, JournalEntry],
  templateUrl: './journal-entries-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntriesPage {
  private readonly journalsApi = inject(JournalsApi);
  protected readonly entries$ = this.journalsApi.listEntries({ type: 'task' });
}
