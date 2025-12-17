import { Directive } from '@angular/core';

@Directive({
  selector: '[uiCancelButton]',
  host: {
    class:
      'inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-4 py-2 text-sm font-semibold text-slate-100 ' +
      'transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 focus-visible:ring-offset-0 ' +
      'disabled:cursor-not-allowed disabled:opacity-60',
    type: 'button',
  },
})
export class CancelButtonDirective {}
