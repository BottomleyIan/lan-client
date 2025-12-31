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
import type { HandlersTaskDTO } from '../../../core/api/generated/api-types';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';
import { MarkdownComponent } from 'ngx-markdown';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { TasksApi } from '../../../core/api/tasks.api';
import { apiUrl } from '../../../core/api/api-url';
import { Tags } from '../../tags/tags';

@Component({
  selector: 'app-calendar-task',
  imports: [CommonModule, TaskIcon, MarkdownComponent, IconButtonDanger, Tags],
  templateUrl: './calendar-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarTask {
  private readonly taskApi = inject(TasksApi);

  readonly task = input.required<HandlersTaskDTO>();
  readonly deleted = output<HandlersTaskDTO>();
  readonly showLabel = input(true);

  protected readonly label = computed(() => {
    const task = this.task();
    return task.title?.trim() || task.body?.trim() || 'Task';
  });

  protected readonly body = computed(() => {
    const task = this.task();
    return rewriteAssetPaths(task.body?.trim() ?? '');
  });
  protected readonly tags: Signal<string[]> = computed(() => {
    const task = this.task();
    return task.tags ?? [];
  });

  protected onDelete(): void {
    const task = this.task();
    if (!task.year || !task.month || !task.day || !task.hash) {
      return;
    }

    this.taskApi.deleteTask(task.year, task.month, task.day, task.hash).subscribe({
      next: () => this.deleted.emit(task),
      error: (err) => console.error(err),
    });
  }
}

function rewriteAssetPaths(markdown: string): string {
  if (!markdown) {
    return '';
  }
  return markdown.replace(ASSET_LINK_PATTERN, (_match, altText, assetPath) => {
    const url = `${apiUrl('api/journals/assets')}?path=${encodeURIComponent(assetPath)}`;
    return `![${altText}](${url})`;
  });
}

const ASSET_LINK_PATTERN = /!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)/g;
