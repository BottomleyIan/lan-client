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
import { PlayerService } from '../../core/services/player-service';
import { Router } from '@angular/router';
import { JournalsApi } from '../../core/api/journals.api';
import { TracksApi } from '../../core/api/tracks.api';
import { finalize } from 'rxjs';
import { take } from 'rxjs/operators';
import { NgxFlickeringGridComponent } from '@omnedia/ngx-flickering-grid';

type ControlCommand = {
  id: string;
  label: string;
  keywords: string[];
  run: () => void;
};

@Component({
  selector: 'app-control-palette',
  imports: [CommonModule, NgxFlickeringGridComponent],
  templateUrl: './control-palette.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlPalette {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly player = inject(PlayerService);
  private readonly journalsApi = inject(JournalsApi);
  private readonly tracksApi = inject(TracksApi);
  private readonly router = inject(Router);

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly textareaEl = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  protected readonly isOpen = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly mode = signal<'command' | 'add'>('command');
  protected readonly query = signal('');

  private readonly commands: ControlCommand[] = [
    { id: 'play', label: 'play', keywords: ['play'], run: () => this.player.play() },
    { id: 'pause', label: 'pause', keywords: ['pause'], run: () => this.player.pause() },
    { id: 'next', label: 'next', keywords: ['next', 'skip'], run: () => this.player.next() },
    {
      id: 'add',
      label: 'add',
      keywords: ['add', 'new note', 'note'],
      run: () => this.enterAddMode(),
    },
    {
      id: 'today',
      label: 'today',
      keywords: ['today'],
      run: () => this.openToday(),
    },
    {
      id: 'tasks',
      label: 'tasks',
      keywords: ['tasks'],
      run: () => this.openTasks(),
    },
    {
      id: 'tasks-tag',
      label: 'tasks {tag}',
      keywords: ['tasks ', 'task '],
      run: () => this.openTasksTag(),
    },
    {
      id: 'notes-tag',
      label: 'notes {tag}',
      keywords: ['notes ', 'note '],
      run: () => this.openNotesTag(),
    },
    {
      id: 'notes',
      label: 'notes',
      keywords: ['notes'],
      run: () => this.openToday(),
    },
    {
      id: 'help',
      label: 'help',
      keywords: ['help', 'commands'],
      run: () => this.openHelp(),
    },
    {
      id: 'settings',
      label: 'settings',
      keywords: ['settings', 'prefs', 'preferences'],
      run: () => this.openSettings(),
    },
    {
      id: 'rate',
      label: 'rate 1-5',
      keywords: ['rate ', 'rating'],
      run: () => this.rateCurrentTrack(),
    },
    {
      id: 'youtube',
      label: 'youtube tags|url',
      keywords: ['youtube '],
      run: () => this.createYoutubeEntry(),
    },
  ];

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
    const labels = this.commands.map((command) => command.label);
    return Array.from(new Set(labels));
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
    if (match.id === 'rate') {
      this.rateCurrentTrack();
      return;
    }
    match.run();
    if (this.mode() === 'command') {
      this.close();
    }
  }

  private openHelp(): void {
    void this.router.navigate(['/help']);
  }

  private openSettings(): void {
    void this.router.navigate(['/settings']);
  }

  private openToday(): void {
    const today = new Date();
    void this.router.navigate([
      '/notes',
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    ]);
  }

  private openTasks(): void {
    void this.router.navigate(['/tasks']);
  }

  private openTasksTag(): void {
    const tag = this.extractTag('tasks');
    if (!tag) {
      return;
    }
    void this.router.navigate(['/tasks'], { queryParams: { tag } });
  }

  private openNotesTag(): void {
    const tag = this.extractTag('notes');
    if (!tag) {
      return;
    }
    void this.router.navigate(['/notes'], { queryParams: { tag } });
  }

  private rateCurrentTrack(): void {
    const rating = this.extractRating();
    if (rating === null) {
      return;
    }
    this.player.currentTrack$.pipe(take(1)).subscribe((track) => {
      if (!track?.id) {
        return;
      }
      this.tracksApi.updateTrackRating(track.id, { rating }).subscribe({
        next: (updated) => {
          const nextRating = updated.rating ?? rating;
          this.player.updateTrackInQueue(String(updated.id ?? track.id), { rating: nextRating });
          this.close();
        },
      });
    });
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

  private extractTag(prefix: 'notes' | 'tasks'): string | null {
    const value = this.query().trim();
    const lower = value.toLowerCase();
    const target = `${prefix} `;
    if (!lower.startsWith(target)) {
      return null;
    }
    const tag = value.slice(target.length).trim();
    return tag.length > 0 ? tag : null;
  }

  private extractRating(): number | null {
    const value = this.query().trim();
    const parts = value.split(/\s+/);
    if (parts.length < 2 || parts[0].toLowerCase() !== 'rate') {
      return null;
    }
    const rating = Number(parts[1]);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return null;
    }
    return rating;
  }

  private createYoutubeEntry(): void {
    const payload = this.parseYoutubePayload();
    if (!payload || this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    const today = new Date();
    this.journalsApi
      .createJournalEntryRaw(today.getFullYear(), today.getMonth() + 1, today.getDate(), {
        raw: payload,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.query.set('');
          this.close();
        },
      });
  }

  private parseYoutubePayload(): string | null {
    const raw = this.query().trim();
    const withoutCommand = raw.replace(/^youtube\s+/i, '');
    const [tagsPart, urlPart] = withoutCommand.split('|');
    if (!tagsPart || !urlPart) {
      return null;
    }
    const tags = tagsPart
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const url = urlPart.trim();
    if (!url) {
      return null;
    }
    const tagString = tags.map((tag) => `[[${tag}]]`).join('');
    return `TODO [[youtube]][[watch-later]]${tagString}[youtube](${url})`;
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
