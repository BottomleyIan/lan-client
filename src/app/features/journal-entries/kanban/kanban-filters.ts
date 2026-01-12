import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { InputDirective } from '../../../ui/directives/input';
import { AppDialog } from '../../../ui/dialog/dialog';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { JournalsApi } from '../../../core/api/journals.api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-kanban-filters',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputDirective,
    AppDialog,
    IconButtonPrimary,
    IconButtonDanger,
  ],
  templateUrl: './kanban-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanFilters {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly tagOptions = input<string[]>([]);

  protected readonly tag = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.queryParamMap) },
  );
  protected readonly priority = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizePriority(params))),
    { initialValue: normalizePriority(this.route.snapshot.queryParamMap) },
  );
  protected readonly tagControl = this.formBuilder.nonNullable.control('');
  protected readonly priorityControl = this.formBuilder.nonNullable.control<PriorityFilter>('all');
  protected readonly priorityOptions = PRIORITY_FILTER_OPTIONS;
  protected readonly quickAddControl = this.formBuilder.nonNullable.control('', {
    validators: [Validators.required],
  });
  protected readonly isSaving = signal(false);
  protected readonly canQuickAdd = computed(() => this.tag().trim().length > 0);
  private readonly quickAddDialog = viewChild.required<AppDialog>('quickAddDialog');
  private readonly quickAddInput = viewChild<ElementRef<HTMLInputElement>>('quickAddInput');

  constructor() {
    effect(() => {
      const currentTag = this.tag();
      if (this.tagControl.value !== currentTag) {
        this.tagControl.setValue(currentTag, { emitEvent: false });
      }
    });
    effect(() => {
      const currentPriority = this.priority();
      if (this.priorityControl.value !== currentPriority) {
        this.priorityControl.setValue(currentPriority, { emitEvent: false });
      }
    });
    this.tagControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        void this.router.navigate([], {
          queryParams: { tag: value || null },
          queryParamsHandling: 'merge',
        });
      });
    this.priorityControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        void this.router.navigate([], {
          queryParams: { priority: value === 'all' ? null : value },
          queryParamsHandling: 'merge',
        });
      });
  }

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
    const description = this.quickAddControl.value.trim();
    if (!description) {
      this.quickAddControl.markAsTouched();
      return;
    }
    if (this.isSaving()) {
      return;
    }
    const tagValue = this.tag().trim();
    if (!tagValue) {
      return;
    }
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
        },
        error: (error) => {
          console.error(error);
        },
      });
  }
}

export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

const PRIORITY_FILTER_OPTIONS: Array<{ value: PriorityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function normalizePriority(params: ParamMap): PriorityFilter {
  const raw = params.get('priority')?.trim().toLowerCase();
  if (raw === 'high' || raw === 'medium' || raw === 'low') {
    return raw;
  }
  return 'all';
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}
