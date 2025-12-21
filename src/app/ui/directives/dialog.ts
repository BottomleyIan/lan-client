import { Directive } from '@angular/core';

@Directive({
  selector: '[uiDialog]',
  host: {
    class:
      'g-title" class="fixed inset-0 size-auto max-h-none max-w-none overflow-y-auto bg-transparent backdrop:bg-transparent' +
      'flex flex-col gap-3',
    role: 'form',
  },
})
export class DialogDirective {}
