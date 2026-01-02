import { Directive } from '@angular/core';

@Directive({
  selector: '[uiForm]',
  host: {
    class: ' ' + 'flex flex-col gap-3',
    role: 'form',
  },
})
export class FormDirective {}
