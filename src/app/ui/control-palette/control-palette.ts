import { CommonModule } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  computed,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgxFlickeringGridComponent } from '@omnedia/ngx-flickering-grid';
import { JournalsApi } from '../../core/api/journals.api';
import { finalize } from 'rxjs';
import { ControlPaletteCommandsService, type ControlCommand } from './control-palette-commands';

@Component({
  selector: 'app-control-palette',
  imports: [CommonModule, NgxFlickeringGridComponent],
  templateUrl: './control-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlPalette {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commandsService = inject(ControlPaletteCommandsService);
  private readonly journalsApi = inject(JournalsApi);

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly textareaEl = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  protected readonly isOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly mode = signal<'command' | 'add'>('command');
  protected readonly query = signal('');

  private readonly commands: ControlCommand[] = this.commandsService.getCommands({
    openAdd: () => this.enterAddMode(),
    closePalette: () => this.close(),
    getQuery: () => this.query(),
    setQuery: (value) => this.query.set(value),
    setSaving: (value) => this.isSaving.set(value),
    isSaving: () => this.isSaving(),
  });

  protected readonly filteredCommands = computed(() => {
    if (this.mode() !== 'command') {
      return [];
    }
    const value = this.query().trim().toLowerCase();
    if (!value) {
      return this.commands.filter(
        (command) => command.id !== 'tasks-tag' && command.id !== 'notes-tag',
      );
    }
    return this.commands.filter((command) => this.matchesCommand(command, value));
  });
  protected readonly commandOptions = computed(() => {
    return this.commandsService.getOptions();
  });

  constructor() {
    const handler = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) {
        return;
      }
      if (this.shouldOpen(event)) {
        event.preventDefault();
        this.open();
        return;
      }
      if (event.key === 'Escape' && this.isOpen()) {
        event.preventDefault();
        this.close();
      }
    };

    this.document.addEventListener('keydown', handler);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', handler));
  }

  protected open(): void {
    if (this.isOpen()) {
      return;
    }
    this.query.set('');
    this.mode.set('command');
    this.isOpen.set(true);
    window.setTimeout(() => {
      const input = this.inputEl();
      if (input) {
        input.nativeElement.focus();
      }
    }, 0);
  }

  protected close(): void {
    this.isOpen.set(false);
    this.mode.set('command');
  }

  protected handleBackdropClick(): void {
    this.close();
  }

  protected handlePanelClick(event: Event): void {
    event.stopPropagation();
  }

  protected handleInput(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      this.query.set(target.value);
    }
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'Enter') {
      if (this.mode() === 'add') {
        if (!event.shiftKey) {
          event.preventDefault();
          this.submitAdd();
        }
        return;
      }
      event.preventDefault();
      this.runFirstMatch();
    }
  }

  private runFirstMatch(): void {
    const match = this.filteredCommands()[0];
    if (!match) {
      return;
    }
    if (match.id === 'rate' || match.id === 'youtube') {
      match.run();
      return;
    }
    match.run();
    if (this.mode() === 'command') {
      this.close();
    }
  }

  private matchesCommand(command: ControlCommand, value: string): boolean {
    if (command.id === 'notes-tag') {
      return value.startsWith('notes ') && value.length > 'notes '.length;
    }
    if (command.id === 'tasks-tag') {
      return value.startsWith('tasks ') && value.length > 'tasks '.length;
    }
    if (command.id === 'rate') {
      return value.startsWith('rate');
    }
    if (command.id === 'youtube') {
      return value.startsWith('youtube ');
    }
    return command.keywords.some((keyword) => keyword.includes(value));
  }

  private enterAddMode(): void {
    this.query.set('');
    this.mode.set('add');
    window.setTimeout(() => {
      const textarea = this.textareaEl();
      if (textarea) {
        textarea.nativeElement.focus();
      }
    }, 0);
  }

  private submitAdd(): void {
    const body = this.query().trim();
    if (!body || this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    const today = new Date();
    this.journalsApi
      .createJournalEntryRaw(today.getFullYear(), today.getMonth() + 1, today.getDate(), {
        raw: body,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.query.set('');
          this.close();
        },
      });
  }

  private shouldOpen(event: KeyboardEvent): boolean {
    if (!event.ctrlKey || !event.shiftKey) {
      return false;
    }
    return event.key.toLowerCase() === 'p';
  }
}
