import { Directive } from '@angular/core';

@Directive({
  selector: '[uiForm]',
  host: {
    class:
      'rounded-xl border border-white/10 bg-white/5 p-4 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] ' +
      'flex flex-col gap-3',
    role: 'form',
  },
})
export class FormDirective {}
