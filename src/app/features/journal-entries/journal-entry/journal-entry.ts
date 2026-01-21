// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  Signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ElementRef } from '@angular/core';
import type { HandlersUpdateJournalEntryRequest } from '../../../core/api/generated/api-types';
import type { JournalEntryWithPriority } from '../../../core/api/journal-entry-priority';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TaskIcon } from '../../../shared/tasks/task-icon/task-icon';
import { MarkdownBody } from '../../../shared/markdown/markdown-body';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { JournalsApi } from '../../../core/api/journals.api';
import { withEntryPriority } from '../../../core/api/journal-entry-priority';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { InputDirective } from '../../../ui/directives/input';
import { AppDialog } from '../../../ui/dialog/dialog';
import { ImagesApi } from '../../../core/api/images.api';

@Component({
  selector: 'app-journal-entry',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputDirective,
    TaskIcon,
    MarkdownBody,
    IconButtonDanger,
    IconButtonPrimary,
    AppDialog,
  ],
  templateUrl: './journal-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntry {
  private readonly journalsApi = inject(JournalsApi);
  private readonly imagesApi = inject(ImagesApi);
  private readonly formBuilder = inject(FormBuilder);

  readonly entry = input.required<JournalEntryWithPriority>();
  readonly deleted = output<JournalEntryWithPriority>();
  readonly showLabel = input(true);

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly entryState = signal<JournalEntryWithPriority | null>(null);
  protected readonly uploadInputId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-asset-${id}`;
  });
  private readonly uploadInput = viewChild.required<ElementRef<HTMLInputElement>>('uploadInput');
  private readonly calendarImageDialog = viewChild.required<AppDialog>('calendarImageDialog');
  private readonly calendarImageFile = signal<File | null>(null);
  protected readonly calendarFileError = signal<string | null>(null);
  protected readonly calendarAltId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-calendar-alt-${id}`;
  });
  protected readonly calendarFileId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-calendar-file-${id}`;
  });
  protected readonly calendarDialogTitleId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-calendar-title-${id}`;
  });
  protected readonly calendarDialogDescriptionId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-calendar-description-${id}`;
  });
  protected readonly hasCalendarFile = computed(() => !!this.calendarImageFile());
  protected readonly calendarAltForm = this.formBuilder.nonNullable.group({
    alt: ['', [Validators.required]],
  });
  protected readonly editForm = this.formBuilder.nonNullable.group({
    raw: ['', [Validators.required]],
  });
  protected readonly rawInputId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-raw-${id}`;
  });
  private readonly rawInput = viewChild<ElementRef<HTMLTextAreaElement>>('rawInput');

  constructor() {
    effect(
      () => {
        this.entryState.set(this.entry());
      },
      { allowSignalWrites: true },
    );
    effect(() => {
      if (!this.isEditing()) {
        return;
      }
      queueMicrotask(() => {
        requestAnimationFrame(() => {
          this.rawInput()?.nativeElement.focus();
        });
      });
    });
  }

  protected readonly label = computed(() => {
    const entry = this.entryState() ?? this.entry();
    return entry.title?.trim() || entry.body?.trim() || 'Entry';
  });

  protected readonly body = computed(() => {
    const entry = this.entryState() ?? this.entry();
    return entry.body?.trim() ?? '';
  });
  protected readonly tags: Signal<string[]> = computed(() => {
    const entry = this.entryState() ?? this.entry();
    return entry.tags ?? [];
  });

  protected onDelete(): void {
    const entry = this.entryState() ?? this.entry();
    if (!entry.year || !entry.month || !entry.day || !entry.hash) {
      return;
    }

    this.journalsApi.deleteJournalEntry(entry.year, entry.month, entry.day, entry.hash).subscribe({
      next: () => this.deleted.emit(entry),
      error: (err) => console.error(err),
    });
  }

  protected handleAssetSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const entry = this.entryState() ?? this.entry();
    const year = entry.year;
    const month = entry.month;
    const day = entry.day;
    const position = entry.position;
    if (year === undefined || month === undefined || day === undefined || position === undefined) {
      return;
    }
    if (this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    this.journalsApi
      .uploadAsset(file)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (asset) => {
          const path = asset.path?.trim();
          if (!path) {
            return;
          }
          const link = `![${path}](../assets/${path})`;
          const currentBody = (this.entryState() ?? this.entry()).body?.trim() ?? '';
          const nextBody = currentBody ? `${currentBody}\n\n${link}` : link;
          const payload: HandlersUpdateJournalEntryRequest = { raw: nextBody };
          this.isSaving.set(true);
          this.journalsApi
            .updateJournalEntry(year, month, day, position, payload)
            .pipe(finalize(() => this.isSaving.set(false)))
            .subscribe({
              next: (updatedEntry) => {
                this.entryState.set(withEntryPriority(updatedEntry));
                if (this.isEditing()) {
                  this.editForm.controls.raw.setValue(nextBody);
                }
              },
              error: (err) => console.error(err),
            });
        },
        error: (err) => console.error(err),
      });
  }

  protected triggerAssetUpload(): void {
    this.uploadInput().nativeElement.click();
  }

  protected openCalendarImageDialog(): void {
    this.calendarImageFile.set(null);
    this.calendarFileError.set(null);
    this.calendarAltForm.reset({ alt: '' });
    this.calendarAltForm.controls.alt.markAsUntouched();
    this.calendarImageDialog().open();
  }

  protected closeCalendarImageDialog(): void {
    this.calendarImageDialog().close();
  }

  protected handleCalendarFileSelected(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) {
      this.calendarImageFile.set(null);
      return;
    }
    if (!isWebpFile(file)) {
      this.calendarImageFile.set(null);
      this.calendarFileError.set('Only .webp images are allowed.');
      return;
    }
    this.calendarFileError.set(null);
    this.calendarImageFile.set(file);
  }

  protected saveCalendarImage(): void {
    const entry = this.entryState() ?? this.entry();
    if (!entry.year || !entry.month || !entry.day || entry.position === undefined) {
      return;
    }
    const file = this.calendarImageFile();
    const altControl = this.calendarAltForm.controls.alt;
    const trimmedAlt = altControl.value.trim();
    altControl.setValue(trimmedAlt);
    if (!file) {
      this.calendarFileError.set('Select a .webp image to upload.');
      return;
    }
    if (!trimmedAlt) {
      altControl.markAsTouched();
      return;
    }
    if (this.isSaving()) {
      return;
    }
    this.isSaving.set(true);
    const renamed = withUuidFileName(file);
    this.imagesApi
      .uploadImage('calendar', renamed)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (uploaded) => {
          const path = uploaded.path?.trim() || uploaded.filename?.trim();
          if (!path) {
            return;
          }
          const normalized = path.startsWith('/') ? path.slice(1) : path;
          const markdown = `![${trimmedAlt}](/api/${normalized})`;
          this.appendMarkdownToEntry(markdown);
          this.closeCalendarImageDialog();
        },
        error: (err) => console.error(err),
      });
  }

  protected startEdit(): void {
    const entry = this.entryState() ?? this.entry();
    const raw = entry.body?.trim() ?? '';
    this.editForm.controls.raw.setValue(raw);
    this.editForm.controls.raw.markAsUntouched();
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected saveEdit(): void {
    const entry = this.entryState() ?? this.entry();
    if (!entry.year || !entry.month || !entry.day || entry.position === undefined) {
      return;
    }

    const rawControl = this.editForm.controls.raw;
    const trimmed = rawControl.value.trim();
    rawControl.setValue(trimmed);
    if (!trimmed) {
      rawControl.markAsTouched();
      return;
    }

    if (this.isSaving()) {
      return;
    }

    const payload: HandlersUpdateJournalEntryRequest = { raw: trimmed };
    this.isSaving.set(true);
    this.journalsApi
      .updateJournalEntry(entry.year, entry.month, entry.day, entry.position, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedEntry) => {
          this.entryState.set(withEntryPriority(updatedEntry));
          this.isEditing.set(false);
        },
        error: (err) => console.error(err),
      });
  }

  private appendMarkdownToEntry(markdown: string): void {
    const entry = this.entryState() ?? this.entry();
    if (!entry.year || !entry.month || !entry.day || entry.position === undefined) {
      return;
    }
    const currentBody = entry.body?.trim() ?? '';
    const nextBody = currentBody ? `${currentBody}\n\n${markdown}` : markdown;
    const payload: HandlersUpdateJournalEntryRequest = { raw: nextBody };
    this.isSaving.set(true);
    this.journalsApi
      .updateJournalEntry(entry.year, entry.month, entry.day, entry.position, payload)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedEntry) => {
          this.entryState.set(withEntryPriority(updatedEntry));
          if (this.isEditing()) {
            this.editForm.controls.raw.setValue(nextBody);
          }
        },
        error: (err) => console.error(err),
      });
  }
}

function isWebpFile(file: File): boolean {
  if (file.type === 'image/webp') {
    return true;
  }
  return file.name.toLowerCase().endsWith('.webp');
}

function withUuidFileName(file: File): File {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const baseName = file.name.replace(/\.[^/.]+$/, '') || 'calendar-image';
  const safeBase = baseName.replace(/[^a-zA-Z0-9_-]+/g, '-');
  const nextName = `${safeBase}.${uuid}.webp`;
  return new File([file], nextName, { type: file.type || 'image/webp' });
}
