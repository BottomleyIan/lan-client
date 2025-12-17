import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualizerService } from '../../core/services/equalizer.service';

@Component({
  selector: 'app-equalizer-display',
  imports: [CommonModule],
  template: `
    <div
      class="relative rounded-xl border border-emerald-300/20 bg-gradient-to-b from-slate-900/70 via-slate-950 to-slate-900/80 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_12px_30px_rgba(0,0,0,0.35)]"
      role="img"
      aria-label="Visual equalizer display"
    >
      <div class="grid h-24 grid-cols-10 items-end gap-2">
        @for (level of bands(); track $index) {
          <div class="relative h-full rounded-sm bg-slate-800/70">
            <div
              class="absolute inset-x-0 bottom-0 rounded-sm bg-gradient-to-t from-emerald-400 via-lime-300 to-amber-200 shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
              [style.height.%]="level * 100"
            ></div>
          </div>
        }
      </div>
      <div
        class="pointer-events-none absolute inset-0 rounded-xl border border-white/5 mix-blend-screen"
        aria-hidden="true"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqualizerDisplay {
  private readonly equalizer = inject(EqualizerService);

  protected readonly bands = computed(() => this.equalizer.bands());
}
