import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notes-tag',
  imports: [CommonModule, RouterLink],
  templateUrl: './notes-tag.html',
  exportAs: 'notesTag',
  host: {
    '[class]': 'hostClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesTag {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tag = input<string | null>(null);
  readonly positionClass = input('');

  readonly element = this.host.nativeElement;

  protected readonly hostClass = computed(() => {
    const base =
      'bg-tokyo-surface-1 z-1 rounded-full border px-3 py-1 text-sm font-semibold transition ' +
      'hover:text-tokyo-accent-orange';
    const position = this.positionClass();
    if (this.tag()) {
      return `${position} ${base} border-white/10 text-tokyo-accent-cyan`;
    }
    return `${position} ${base} border-white/5 text-tokyo-text-muted opacity-60`;
  });
}
