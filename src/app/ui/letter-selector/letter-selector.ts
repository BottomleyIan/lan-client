import { CommonModule } from '@angular/common';
import type { OnDestroy } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BigButtonDirective } from '../directives/big-button';

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
const LETTERS = ['*', ...ALPHA_LETTERS] as const;
const LETTERS_WITH_SPACE = ['*', ' ', ...ALPHA_LETTERS] as const;
type LetterOption = (typeof LETTERS_WITH_SPACE)[number];

@Component({
  selector: 'app-letter-selector',
  imports: [BigButtonDirective, CommonModule],
  templateUrl: './letter-selector.html',
  styles: [
    `
      :host {
        display: block;
      }

      button[data-selected='true'] {
        border-color: rgba(34, 211, 238, 0.65);
        background: linear-gradient(180deg, rgba(34, 211, 238, 0.18), rgba(236, 72, 153, 0.12));
        box-shadow:
          0 0 0 1px rgba(255, 255, 255, 0.06) inset,
          0 8px 28px rgba(0, 0, 0, 0.35);
      }

      button[data-selected='true'] span {
        filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.75));
      }
    `,
  ],
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
export class LetterSelector implements OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private debounceId: ReturnType<typeof setTimeout> | null = null;

  readonly field = input.required<string>();
  readonly previous = input<(() => void) | undefined>(undefined);
  readonly next = input<(() => void) | undefined>(undefined);
  readonly includeSpace = input(false);

  protected readonly letters = computed<readonly LetterOption[]>(() =>
    this.includeSpace() ? LETTERS_WITH_SPACE : LETTERS,
  );
  protected readonly selected = signal<LetterOption>(LETTERS[0]);

  protected readonly activeDescendantId = computed(() => this.optionId(this.selected()));
  protected readonly ariaLabel = computed(() => `Filter ${this.field()} by starting letter`);

  private readonly syncFromQuery = effect(() => {
    const params = this.queryParams();
    const existing = params.get(this.field());
    const options: readonly LetterOption[] = this.letters();
    if (existing && options.includes(existing as LetterOption)) {
      this.selected.set(existing as LetterOption);
    } else if (!existing) {
      this.selected.set(LETTERS[0]);
    }
  });

  protected select(letter: LetterOption): void {
    if (this.selected() === letter) {
      return;
    }
    this.selected.set(letter);
    this.queueQueryUpdate();
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
      this.scrollSelectedIntoView();
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
      this.queueQueryUpdate();
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      this.selected.set(letters[letters.length - 1]);
      this.queueQueryUpdate();
      return;
    }
    if (key.length === 1) {
      const upper = key.toUpperCase();
      const match = letters.find((letter) => letter === upper);
      if (match) {
        this.selected.set(match);
        this.queueQueryUpdate();
      } else if (key === '*') {
        this.selected.set('*');
        this.queueQueryUpdate();
      } else if (key === ' ') {
        const includesSpace = letters.includes(' ');
        if (includesSpace) {
          this.selected.set(' ');
          this.queueQueryUpdate();
        }
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.debounceId) {
      clearTimeout(this.debounceId);
      this.debounceId = null;
    }
    this.syncFromQuery.destroy();
  }

  private shiftSelection(offset: 1 | -1): void {
    const letters: readonly LetterOption[] = this.letters();
    this.selected.update((current) => {
      const index = letters.indexOf(current);
      const nextIndex = (index + offset + letters.length) % letters.length;
      return letters[nextIndex];
    });
    this.queueQueryUpdate();
  }

  private queueQueryUpdate(): void {
    if (this.debounceId) {
      clearTimeout(this.debounceId);
    }
    this.debounceId = setTimeout(() => {
      this.debounceId = null;
      this.writeQueryParam();
    }, 200);
  }

  private writeQueryParam(): void {
    const field = this.field();
    const value = this.selected();
    const current = this.queryParams().get(field);
    if (current === value) {
      return;
    }
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [field]: value },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  private scrollSelectedIntoView(): void {
    const optionId = this.optionId(this.selected());
    const target = this.host.nativeElement.querySelector(`#${optionId}`) as HTMLElement | null;
    target?.scrollIntoView({ block: 'nearest' });
  }
}
