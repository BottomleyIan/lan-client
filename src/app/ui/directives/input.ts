import { Directive } from '@angular/core';

@Directive({
  selector: '[uiInput]',
  host: {
    class:
      'w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white ' +
      'placeholder:text-slate-500 focus-visible:border-cyan-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ' +
      'disabled:cursor-not-allowed disabled:opacity-60',
  },
})
export class InputDirective {}
