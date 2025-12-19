import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ColorSample = {
  readonly name: string;
  readonly cssVar: string;
};

const COLOR_SAMPLES: readonly ColorSample[] = [
  { name: 'Surface 0', cssVar: 'var(--color-darcula-surface-0)' },
  { name: 'Surface 1', cssVar: 'var(--color-darcula-surface-1)' },
  { name: 'Surface 2', cssVar: 'var(--color-darcula-surface-2)' },
  { name: 'Surface 3', cssVar: 'var(--color-darcula-surface-3)' },
  { name: 'Border', cssVar: 'var(--color-darcula-border)' },
  { name: 'Text', cssVar: 'var(--color-darcula-text)' },
  { name: 'Text Muted', cssVar: 'var(--color-darcula-text-muted)' },
  { name: 'Text Subtle', cssVar: 'var(--color-darcula-text-subtle)' },
  { name: 'Accent Purple', cssVar: 'var(--color-darcula-accent-purple)' },
  { name: 'Accent Blue', cssVar: 'var(--color-darcula-accent-blue)' },
  { name: 'Accent Cyan', cssVar: 'var(--color-darcula-accent-cyan)' },
  { name: 'Accent Green', cssVar: 'var(--color-darcula-accent-green)' },
  { name: 'Accent Orange', cssVar: 'var(--color-darcula-accent-orange)' },
  { name: 'Accent Red', cssVar: 'var(--color-darcula-accent-red)' },
  { name: 'Accent Yellow', cssVar: 'var(--color-darcula-accent-yellow)' },
  { name: 'Accent Pink', cssVar: 'var(--color-darcula-accent-pink)' },
];

@Component({
  selector: 'app-tasks-page',
  imports: [CommonModule],
  template: `
    <section class="flex flex-col gap-3 p-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-100">Tasks</h1>
        <p class="text-sm text-slate-300">Darcula color reference.</p>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        @for (color of colors; track color.name) {
          <div class="rounded-lg border border-white/10 bg-white/5 p-3">
            <div class="h-16 w-full rounded-md" [style.backgroundColor]="color.cssVar"></div>
            <div class="mt-2 text-sm font-semibold" [style.color]="color.cssVar">
              {{ color.name }}
            </div>
            <div class="text-xs text-slate-400">{{ color.cssVar }}</div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  readonly colors = COLOR_SAMPLES;
}
