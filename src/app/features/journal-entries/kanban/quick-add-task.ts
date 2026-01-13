import { CommonModule } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { InputDirective } from '../../../ui/directives/input';
import { JournalsApi } from '../../../core/api/journals.api';
import type { PriorityFilter } from './kanban-filters';

@Component({
  selector: 'app-quick-add-task',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AppDialog,
    IconButtonPrimary,
    IconButtonDanger,
    InputDirective,
  ],
  templateUrl: './quick-add-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAddTask {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly tags = input<string[]>([]);
  readonly priority = input<PriorityFilter>('all');
  readonly taskCreated = output<void>();

  protected readonly quickAddControl = this.formBuilder.nonNullable.control('', {
    validators: [Validators.required],
  });
  protected readonly isSaving = signal(false);
  protected readonly canQuickAdd = computed(() => this.tags().length > 0);
  private readonly quickAddDialog = viewChild.required<AppDialog>('quickAddDialog');
  private readonly quickAddInput = viewChild<ElementRef<HTMLInputElement>>('quickAddInput');

  protected openQuickAdd(): void {
    if (!this.canQuickAdd()) {
      return;
    }
    this.quickAddDialog().open();
    queueMicrotask(() => {
      requestAnimationFrame(() => this.quickAddInput()?.nativeElement.focus());
    });
  }

  protected closeQuickAdd(): void {
    this.quickAddDialog().close();
  }

  protected confirmQuickAdd(): void {
    const text = this.quickAddControl.value.trim();
    if (!text) {
      this.quickAddControl.markAsTouched();
      return;
    }
    if (this.isSaving()) {
      return;
    }
    const tags = this.tags();
    const tagValue = tags[0]?.trim();
    if (!tagValue) {
      return;
    }
    const priority = this.priority();
    const priorityValue = priority === 'all' ? 'medium' : priority;
    const description = `${text}\npriority:: ${priorityValue}`;
    this.isSaving.set(true);
    this.journalsApi
      .createJournalEntry({ description, body: '', tags: [tagValue], status: 'TODO' })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.quickAddControl.setValue('');
          this.quickAddDialog().close();
          this.taskCreated.emit();
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}
