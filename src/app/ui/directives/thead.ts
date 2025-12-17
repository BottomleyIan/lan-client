import { Directive } from '@angular/core';

@Directive({
  selector: '[uiTHead]',
  standalone: true,
  host: {
    class: 'bg-white/5 text-left text-xs tracking-[0.16em] text-slate-400 uppercase',
  },
})
export class TableHeadDirective {}
