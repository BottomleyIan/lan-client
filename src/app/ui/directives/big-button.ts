import { Directive } from '@angular/core';

@Directive({
  selector: '[uiBigButton]',
  standalone: true,
  host: {
    class:
      'group overflow-hidden bg-black/50 ' +
      'transition hover:bg-gray-900/70 ' +
      'focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-0 focus-visible:outline-none' +
      'text-left  data-[selected=true]:border-orange-500',
  },
})
export class BigButtonDirective {}
