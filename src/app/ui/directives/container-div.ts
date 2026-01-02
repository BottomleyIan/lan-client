import { Directive } from '@angular/core';

@Directive({
  selector: '[uiContainerDiv]',
  standalone: true,
  host: {
    class: 'border border-white/50 border-1 rounded-sm',
  },
})
export class ContainerDivDirective {}
