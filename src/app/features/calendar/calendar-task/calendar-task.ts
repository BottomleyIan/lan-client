import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HandlersTaskDTO } from '../../../core/api/generated/api-types';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-calendar-task',
  imports: [CommonModule, TaskIcon, MarkdownComponent],
  templateUrl: './calendar-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarTask {
  readonly task = input.required<HandlersTaskDTO>();
  readonly showLabel = input(true);

  protected readonly label = computed(() => {
    const task = this.task();
    return task.title?.trim() || task.body?.trim() || 'Task';
  });
  protected readonly body = computed(() => {
    const task = this.task();
    return task.body?.trim() || '';
  });
}
