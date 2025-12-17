import { Directive } from '@angular/core';

@Directive({
  selector: '[uiConfirmButton]',
  host: {
    class:
      'inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 ' +
      'transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 focus-visible:ring-offset-0 ' +
      'disabled:cursor-not-allowed disabled:opacity-60',
    type: 'button',
  },
})
export class ConfirmButtonDirective {}
