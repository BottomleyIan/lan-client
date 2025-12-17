import { Directive } from '@angular/core';

@Directive({
  selector: '[uiBigButton]',
  standalone: true,
  host: {
    class:
      'group overflow-hidden rounded-lg border border-gray-800 ' +
      'bg-gray-900/40 transition hover:bg-gray-900/70 ' +
      'text-left ' +
      'focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-0 focus-visible:outline-none',
  },
})
export class BigButtonDirective {}
