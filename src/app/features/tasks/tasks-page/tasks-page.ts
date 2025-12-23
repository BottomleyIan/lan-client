import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksApi } from '../../../core/api/tasks.api';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';

@Component({
  selector: 'app-tasks-page',
  imports: [CommonModule, TaskIcon],
  template: `
    <section class="flex flex-col gap-4 p-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Tasks</h1>
        <p class="text-sm text-slate-300">All tasks from the server.</p>
      </div>
      @if (tasks$ | async; as tasks) {
        @if (tasks.length === 0) {
          <p class="text-sm text-slate-400">No tasks yet.</p>
        } @else {
          <div class="flex flex-col gap-3">
            @for (task of tasks; track task.id) {
              <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                <div class="flex items-start gap-2">
                  <app-task-icon [task]="task" />
                  <pre class="text-xs whitespace-pre-wrap text-slate-200">{{ task | json }}</pre>
                </div>
              </div>
            }
          </div>
        }
      } @else {
        <p class="text-sm text-slate-400" aria-live="polite">Loading tasks…</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  private readonly tasksApi = inject(TasksApi);
  protected readonly tasks$ = this.tasksApi.getTasks();
}
