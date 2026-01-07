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
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  templateUrl: './journal-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalEntry {
  private readonly journalsApi = inject(JournalsApi);
  private readonly formBuilder = inject(FormBuilder);

  readonly entry = input.required<JournalEntryWithPriority>();
  readonly deleted = output<JournalEntryWithPriority>();
  readonly showLabel = input(true);

  protected readonly isEditing = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly entryState = signal<JournalEntryWithPriority | null>(null);
  protected readonly editForm = this.formBuilder.nonNullable.group({
    raw: ['', [Validators.required]],
  });
  protected readonly rawInputId = computed(() => {
    const entry = this.entryState() ?? this.entry();
    const id = entry.hash ?? entry.id ?? entry.position ?? 'current';
    return `entry-raw-${id}`;
  });

  constructor() {
    effect(
      () => {
        this.entryState.set(this.entry());
      },
      { allowSignalWrites: true },
    );
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
}
