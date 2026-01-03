import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HandlersJournalEntryDTO } from '../../../core/api/generated/api-types';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, TaskIcon],
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly entry = input.required<HandlersJournalEntryDTO>();

  protected readonly title = computed(() => {
    const entry = this.entry();
    return entry.title?.trim() || entry.body?.trim() || 'Untitled task';
  });

  protected readonly summary = computed(() => {
    const entry = this.entry();
    const body = entry.body?.trim() ?? '';
    if (!body) {
      return '';
    }
    const firstLine = body.split('\n').find((line) => line.trim().length > 0);
    if (!firstLine) {
      return '';
    }
    if (firstLine === this.title()) {
      return '';
    }
    return firstLine;
  });

  protected readonly tags = computed(() => this.entry().tags ?? []);
  protected readonly statusLabel = computed(() => this.entry().status?.trim() || 'Unsorted');
}
