import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type {
  JournalEntryWithPriority,
  TaskPriority,
} from '../../../core/api/journal-entry-priority';
import { resolveEntryPriority } from '../../../core/api/journal-entry-priority';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { IconName } from '../../../ui/icon/icons';
import { Icon } from '../../../ui/icon/icon';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, TaskIcon, Icon],
  templateUrl: './task-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  readonly entry = input.required<JournalEntryWithPriority>();

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
  protected readonly priority = computed<{
    icon: IconName;
    color: string;
    label: string;
  }>(() => {
    const entry = this.entry();
    const priority = entry.priority ?? resolveEntryPriority(entry) ?? 'medium';
    return priorityDetails(priority);
  });

  protected readonly tags = computed(() => this.entry().tags ?? []);
  protected readonly statusLabel = computed(() => this.entry().status?.trim() || 'Unsorted');
}

function priorityDetails(priority: TaskPriority): { icon: IconName; color: string; label: string } {
  switch (priority) {
    case 'high':
      return { icon: 'priorityHigh', color: '--color-tokyo-accent-red', label: 'high' };
    case 'low':
      return { icon: 'priorityLow', color: '--color-tokyo-accent-green', label: 'low' };
    default:
      return { icon: 'priorityMedium', color: '--color-tokyo-accent-orange', label: 'medium' };
  }
}
