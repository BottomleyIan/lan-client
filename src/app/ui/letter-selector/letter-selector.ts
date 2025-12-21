import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const ALPHA_LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;
const LETTERS = ['*', ...ALPHA_LETTERS, ...DIGITS] as const;
const LETTERS_WITH_SPACE = ['*', ' ', ...ALPHA_LETTERS, ...DIGITS] as const;
export type LetterOption = (typeof LETTERS_WITH_SPACE)[number];

@Component({
  selector: 'app-letter-selector',
  imports: [CommonModule],
  templateUrl: './letter-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'listbox',
    '[id]': 'field()',
    '[attr.aria-label]': 'ariaLabel()',
    'aria-orientation': 'vertical',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    tabindex: '0',
    '(keydown)': 'onKeydown($event)',
  },
})
export class LetterSelector {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly field = input.required<string>();
  readonly previous = input<(() => void) | undefined>(undefined);
  readonly next = input<(() => void) | undefined>(undefined);
  readonly autoSelectOnAdvance = input(false);
  readonly includeSpace = input(false);
  readonly value = input<LetterOption>('*');
  readonly valueChanged = output<LetterOption>();

  protected readonly letters = computed<readonly LetterOption[]>(() =>
    this.includeSpace() ? LETTERS_WITH_SPACE : LETTERS,
  );
  protected readonly selected = signal<LetterOption>(this.value());

  protected readonly activeDescendantId = computed(() => this.optionId(this.selected()));
  protected readonly ariaLabel = computed(() => `Filter ${this.field()} by starting letter`);

  private readonly syncFromValue = effect(() => {
    const incoming = this.value();
    const options: readonly LetterOption[] = this.letters();
    if (options.includes(incoming)) {
      this.selected.set(incoming);
    } else {
      this.selected.set(LETTERS[0]);
    }
  });

  protected select(letter: LetterOption): void {
    if (this.selected() === letter) {
      return;
    }
    this.selected.set(letter);
    this.emitSelection();
  }

  protected isSelected(letter: LetterOption): boolean {
    return this.selected() === letter;
  }

  protected optionId(letter: LetterOption): string {
    const suffix = letter === '*' ? 'any' : letter === ' ' ? 'space' : letter.toLowerCase();
    return `${this.field()}-letter-option-${suffix}`;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const letters: readonly LetterOption[] = this.letters();
    const { key } = event;
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.shiftSelection(1);
      return;
    }
    if (key === 'ArrowUp') {
      event.preventDefault();
      this.shiftSelection(-1);
      return;
    }
    if (key === 'ArrowRight') {
      const next = this.next();
      if (next) {
        event.preventDefault();
        if (this.autoSelectOnAdvance() && this.selected() === '*') {
          this.selectFirstLetter();
        }
        next();
      }
      return;
    }
    if (key === 'ArrowLeft') {
      const previous = this.previous();
      if (previous) {
        event.preventDefault();
        previous();
      }
      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      this.selected.set(LETTERS[0]);
      this.emitSelection();
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      this.selected.set(letters[letters.length - 1]);
      this.emitSelection();
      return;
    }
    if (key.length === 1) {
      const upper = key.toUpperCase();
      const match = letters.find((letter) => letter === upper);
      if (match) {
        this.selected.set(match);
        this.emitSelection();
      } else if (key === '*') {
        this.selected.set('*');
        this.emitSelection();
      } else if (key === ' ') {
        const includesSpace = letters.includes(' ');
        if (includesSpace) {
          this.selected.set(' ');
          this.emitSelection();
        }
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  private shiftSelection(offset: 1 | -1): void {
    const letters: readonly LetterOption[] = this.letters();
    this.selected.update((current) => {
      const index = letters.indexOf(current);
      const nextIndex = (index + offset + letters.length) % letters.length;
      return letters[nextIndex];
    });
    this.emitSelection();
  }

  private emitSelection(): void {
    this.valueChanged.emit(this.selected());
    this.scrollSelectedIntoView();
  }

  private selectFirstLetter(): void {
    const letters = this.letters();
    const first = letters.find((letter) => letter !== '*' && letter !== ' ');
    if (!first || this.selected() === first) {
      return;
    }
    this.selected.set(first);
    this.emitSelection();
  }

  private scrollSelectedIntoView(): void {
    const optionId = this.optionId(this.selected());
    const target = this.host.nativeElement.querySelector(`#${optionId}`) as HTMLElement | null;
    target?.scrollIntoView({ block: 'nearest' });
  }
}
