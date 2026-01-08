import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { InputDirective } from '../../../ui/directives/input';

@Component({
  selector: 'app-kanban-filters',
  imports: [CommonModule, ReactiveFormsModule, InputDirective],
  templateUrl: './kanban-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanFilters {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

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
