import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JournalsApi } from '../../../core/api/journals.api';

@Component({
  selector: 'app-property-keys-page',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="flex flex-col gap-4 p-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Property keys</h1>
        <p class="text-sm text-slate-300">All journal property keys.</p>
      </div>
      @if (keys$ | async; as keys) {
        @if (keys.length === 0) {
          <p class="text-sm text-slate-400">No property keys yet.</p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (key of keys; track key) {
              <a
                class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
                [routerLink]="['/property-keys', key]"
              >
                {{ key }}
              </a>
            }
          </div>
        }
      } @else {
        <p class="text-sm text-slate-400" aria-live="polite">Loading property keys…</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyKeysPage {
  private readonly journalsApi = inject(JournalsApi);
  protected readonly keys$ = this.journalsApi.listPropertyKeys();
}
