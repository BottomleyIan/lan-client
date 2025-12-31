// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HandlersJournalEntryDTO } from '../../../core/api/generated/api-types';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';
import { MarkdownBody } from '../../../shared/markdown/markdown-body';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { JournalsApi } from '../../../core/api/journals.api';
import { Tags } from '../../tags/tags';

@Component({
  selector: 'app-calendar-entry',
  imports: [CommonModule, TaskIcon, MarkdownBody, IconButtonDanger, Tags],
  templateUrl: './calendar-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarEntry {
  private readonly journalsApi = inject(JournalsApi);

  readonly entry = input.required<HandlersJournalEntryDTO>();
  readonly deleted = output<HandlersJournalEntryDTO>();
  readonly showLabel = input(true);

  protected readonly label = computed(() => {
    const entry = this.entry();
    return entry.title?.trim() || entry.body?.trim() || 'Entry';
  });

  protected readonly body = computed(() => {
    const entry = this.entry();
    return entry.body?.trim() ?? '';
  });
  protected readonly tags: Signal<string[]> = computed(() => {
    const entry = this.entry();
    return entry.tags ?? [];
  });

  protected onDelete(): void {
    const entry = this.entry();
    if (!entry.year || !entry.month || !entry.day || !entry.hash) {
      return;
    }

    this.journalsApi
      .deleteJournalEntry(entry.year, entry.month, entry.day, entry.hash)
      .subscribe({
        next: () => this.deleted.emit(entry),
        error: (err) => console.error(err),
      });
  }
}
