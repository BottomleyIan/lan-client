import { Directive } from '@angular/core';

@Directive({
  selector: '[uiH2]',
  standalone: true,
  host: {
    class: 'font-[vt323] text-2xl',
  },
})
export class H2Directive {}
