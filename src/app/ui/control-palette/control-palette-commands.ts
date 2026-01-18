import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from '../../core/services/player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { JournalsApi } from '../../core/api/journals.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TracksApi } from '../../core/api/tracks.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { take } from 'rxjs/operators';

export type ControlCommand = {
  id: string;
  label: string;
  help: string;
  keywords: string[];
  run: () => void;
};

@Injectable({ providedIn: 'root' })
export class ControlPaletteCommandsService {
  constructor(
    private readonly player: PlayerService,
    private readonly journalsApi: JournalsApi,
    private readonly tracksApi: TracksApi,
    private readonly router: Router,
  ) {}

  getCommands(opts: {
    openAdd: () => void;
    closePalette: () => void;
    getQuery: () => string;
    setQuery: (value: string) => void;
    setSaving: (value: boolean) => void;
    isSaving: () => boolean;
  }): ControlCommand[] {
    const commands: ControlCommand[] = [
      {
        id: 'play',
        label: 'play',
        help: 'Start playback.',
        keywords: ['play'],
        run: () => this.player.play(),
      },
      {
        id: 'pause',
        label: 'pause',
        help: 'Pause playback.',
        keywords: ['pause'],
        run: () => this.player.pause(),
      },
      {
        id: 'next',
        label: 'next',
        help: 'Skip to the next track.',
        keywords: ['next', 'skip'],
        run: () => this.player.next(),
      },
      {
        id: 'add',
        label: 'add',
        help: 'Open the quick note editor.',
        keywords: ['add', 'new note', 'note'],
        run: () => opts.openAdd(),
      },
      {
        id: 'today',
        label: 'today',
        help: "Jump to today's notes page.",
        keywords: ['today'],
        run: () => this.openToday(),
      },
      {
        id: 'notes',
        label: 'notes',
        help: "Open today's notes page.",
        keywords: ['notes'],
        run: () => this.openToday(),
      },
      {
        id: 'notes-tag',
        label: 'notes {tag}',
        help: 'Open notes filtered by a tag.',
        keywords: ['notes ', 'note '],
        run: () => this.openNotesTag(opts.getQuery()),
      },
      {
        id: 'tasks',
        label: 'tasks',
        help: 'Open the tasks board.',
        keywords: ['tasks'],
        run: () => this.openTasks(),
      },
      {
        id: 'tasks-tag',
        label: 'tasks {tag}',
        help: 'Open tasks filtered by a tag.',
        keywords: ['tasks ', 'task '],
        run: () => this.openTasksTag(opts.getQuery()),
      },
      {
        id: 'rate',
        label: 'rate 1-5',
        help: 'Rate the current track.',
        keywords: ['rate ', 'rating'],
        run: () => this.rateCurrentTrack(opts.getQuery(), opts.closePalette),
      },
      {
        id: 'youtube',
        label: 'youtube tags|url',
        help: 'Create a TODO entry with tags and a YouTube link.',
        keywords: ['youtube '],
        run: () => this.createYoutubeEntry(opts),
      },
      {
        id: 'cal',
        label: 'cal {mmm} {yy}',
        help: 'Open the calendar month (optionally with month/year).',
        keywords: ['cal'],
        run: () => this.openCalendar(opts.getQuery()),
      },
      {
        id: 'settings',
        label: 'settings',
        help: 'Open the settings page.',
        keywords: ['settings', 'prefs', 'preferences'],
        run: () => this.openSettings(),
      },
      {
        id: 'help',
        label: 'help',
        help: 'Open this help page.',
        keywords: ['help', 'commands'],
        run: () => this.openHelp(),
      },
    ];
    return commands.sort((a, b) => a.label.localeCompare(b.label));
  }

  getHelpCommands(): Array<Pick<ControlCommand, 'id' | 'label' | 'help'>> {
    return this.getCommands({
      openAdd: () => {},
      closePalette: () => {},
      getQuery: () => '',
      setQuery: () => {},
      setSaving: () => {},
      isSaving: () => false,
    }).map(({ id, label, help }) => ({ id, label, help }));
  }

  getOptions(): string[] {
    return this.getHelpCommands().map((command) => command.label);
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

  private openTasksTag(raw: string): void {
    const tag = this.extractTag(raw, 'tasks');
    if (!tag) {
      return;
    }
    void this.router.navigate(['/tasks'], { queryParams: { tag } });
  }

  private openNotesTag(raw: string): void {
    const tag = this.extractTag(raw, 'notes');
    if (!tag) {
      return;
    }
    void this.router.navigate(['/notes'], { queryParams: { tag } });
  }

  private openHelp(): void {
    void this.router.navigate(['/help']);
  }

  private openSettings(): void {
    void this.router.navigate(['/settings']);
  }

  private openCalendar(raw: string): void {
    const target = this.parseCalendarTarget(raw);
    if (!target) {
      return;
    }
    void this.router.navigate(['/notes', target.year, target.month]);
  }

  private rateCurrentTrack(raw: string, closePalette: () => void): void {
    const rating = this.extractRating(raw);
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
          closePalette();
        },
      });
    });
  }

  private createYoutubeEntry(opts: {
    getQuery: () => string;
    setQuery: (value: string) => void;
    setSaving: (value: boolean) => void;
    isSaving: () => boolean;
    closePalette: () => void;
  }): void {
    if (opts.isSaving()) {
      return;
    }
    const payload = this.parseYoutubePayload(opts.getQuery());
    if (!payload) {
      return;
    }
    opts.setSaving(true);
    const today = new Date();
    this.journalsApi
      .createJournalEntryRaw(today.getFullYear(), today.getMonth() + 1, today.getDate(), {
        raw: payload,
      })
      .pipe(finalize(() => opts.setSaving(false)))
      .subscribe({
        next: () => {
          opts.setQuery('');
          opts.closePalette();
        },
      });
  }

  private extractTag(raw: string, prefix: 'notes' | 'tasks'): string | null {
    const value = raw.trim();
    const lower = value.toLowerCase();
    const target = `${prefix} `;
    if (!lower.startsWith(target)) {
      return null;
    }
    const tag = value.slice(target.length).trim();
    return tag.length > 0 ? tag : null;
  }

  private extractRating(raw: string): number | null {
    const value = raw.trim();
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

  private parseYoutubePayload(raw: string): string | null {
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
    return `TODO ${tagString}[youtube](${url})`;
  }

  private parseCalendarTarget(raw: string): { year: number; month: number } | null {
    const trimmed = raw.trim();
    if (!trimmed.toLowerCase().startsWith('cal')) {
      return null;
    }
    const parts = trimmed
      .replace(/^cal\s*/i, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const today = new Date();
    const defaultYear = today.getFullYear();
    const defaultMonth = today.getMonth() + 1;
    if (parts.length === 0) {
      return { year: defaultYear, month: defaultMonth };
    }
    const month = this.parseMonthToken(parts[0]);
    if (month === null) {
      return null;
    }
    const year = parts[1] ? this.parseYearToken(parts[1]) : defaultYear;
    if (year === null) {
      return null;
    }
    return { year, month };
  }

  private parseMonthToken(raw: string): number | null {
    const numeric = Number(raw);
    if (Number.isFinite(numeric)) {
      if (numeric >= 1 && numeric <= 12) {
        return Math.floor(numeric);
      }
    }
    const key = raw.toLowerCase().slice(0, 3);
    const index = MONTH_ABBREVIATIONS.indexOf(key);
    if (index === -1) {
      return null;
    }
    return index + 1;
  }

  private parseYearToken(raw: string): number | null {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      return null;
    }
    const year = Math.floor(numeric);
    if (year >= 0 && year < 100) {
      return 2000 + year;
    }
    if (year >= 1000 && year <= 9999) {
      return year;
    }
    return null;
  }
}

const MONTH_ABBREVIATIONS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];
