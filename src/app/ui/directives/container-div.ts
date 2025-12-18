import { Directive } from '@angular/core';

@Directive({
  selector: '[uiContainerDiv]',
  standalone: true,
  host: {
    class: 'border border-slate-200/40 border-1 ',
  },
})
export class ContainerDivDirective {}
