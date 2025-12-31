import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalsApi } from '../../../core/api/journals.api';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';

@Component({
  selector: 'app-journal-entries-page',
  imports: [CommonModule, TaskIcon],
  template: `
    <section class="flex flex-col gap-4 p-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Journal entries</h1>
        <p class="text-sm text-slate-300">All task entries from the server.</p>
      </div>
      @if (entries$ | async; as entries) {
        @if (entries.length === 0) {
          <p class="text-sm text-slate-400">No entries yet.</p>
        } @else {
          <div class="flex flex-col gap-3">
            @for (entry of entries; track entry.id) {
              <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                <div class="flex items-start gap-2">
                  <app-task-icon [task]="entry" />
                  <pre class="text-xs whitespace-pre-wrap text-slate-200">{{ entry | json }}</pre>
                </div>
              </div>
            }
          </div>
        }
      } @else {
        <p class="text-sm text-slate-400" aria-live="polite">Loading entries…</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntriesPage {
  private readonly journalsApi = inject(JournalsApi);
  protected readonly entries$ = this.journalsApi.listEntries({ type: 'task' });
}
