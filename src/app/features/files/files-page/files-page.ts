import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-files-page',
  imports: [CommonModule],
  template: `
    <section class="flex flex-col gap-3 p-4">
      <h1 class="text-2xl font-semibold text-slate-100">Files</h1>
      <p class="text-sm text-slate-300">Files page coming soon.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesPage {}
