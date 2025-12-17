import { Directive } from '@angular/core';

@Directive({
  selector: '[uiH2]',
  standalone: true,
  host: {
    class: '',
  },
})
export class H2Directive {}
