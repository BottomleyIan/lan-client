import { Directive } from '@angular/core';

@Directive({
  selector: '[uiTable]',
  standalone: true,
  host: {
    class: 'min-w-full border-separate border-spacing-0 text-sm',
  },
})
export class TableDirective {}
