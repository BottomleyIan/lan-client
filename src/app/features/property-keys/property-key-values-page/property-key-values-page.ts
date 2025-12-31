import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';

@Component({
  selector: 'app-property-key-values-page',
  imports: [CommonModule, RouterLink],
  template: `
    <section class="flex flex-col gap-4 p-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Property key values</h1>
        <p class="text-sm text-slate-300">Values for {{ keyLabel() }}.</p>
      </div>
      @if (values$ | async; as values) {
        @if (values.length === 0) {
          <p class="text-sm text-slate-400">No values yet.</p>
        } @else {
          <div class="flex flex-col gap-2">
            @for (value of values; track value) {
              <a
                class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-white/30 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
                [routerLink]="['/notes', value]"
              >
                {{ value }}
              </a>
            }
          </div>
        }
      } @else {
        <p class="text-sm text-slate-400" aria-live="polite">Loading values…</p>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyKeyValuesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly journalsApi = inject(JournalsApi);

  protected readonly key = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeKey(params))),
    {
      initialValue: normalizeKey(this.route.snapshot.paramMap),
    },
  );

  protected readonly keyLabel = computed(() => this.key() ?? 'Unknown key');

  protected readonly values$ = this.route.paramMap.pipe(
    map((params) => normalizeKey(params)),
    switchMap((key) => {
      if (!key) {
        return of<string[]>([]);
      }
      return this.journalsApi.listPropertyKeyValues(key);
    }),
  );
}

function normalizeKey(params: ParamMap): string | null {
  const key = params.get('key');
  return key && key.trim().length > 0 ? key.trim() : null;
}
