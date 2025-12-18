import { Directive } from '@angular/core';

@Directive({
  selector: '[uiContainerDiv]',
  standalone: true,
  host: {
    class: 'border border-slate-200/40 border-1 rounded-sm',
  },
})
export class ContainerDivDirective {}
