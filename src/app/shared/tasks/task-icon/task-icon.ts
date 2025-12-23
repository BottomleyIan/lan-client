import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '../../../ui/icon/icon';
import type { HandlersTaskDTO } from '../../../core/api/generated/api-types';
import { getTaskAccentClass, getTaskStatusConfig } from '../task-status';

@Component({
  selector: 'app-task-icon',
  imports: [CommonModule, Icon],
  templateUrl: './task-icon.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskIcon {
  readonly task = input.required<HandlersTaskDTO>();

  protected readonly statusConfig = computed(() => getTaskStatusConfig(this.task().status));
  protected readonly accentClass = computed(() => getTaskAccentClass(this.task()));
}
