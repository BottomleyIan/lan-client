import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { InputDirective } from '../../../ui/directives/input';

@Component({
  selector: 'app-notes-tag-filter',
  imports: [CommonModule, ReactiveFormsModule, InputDirective],
  templateUrl: './notes-tag-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesTagFilter {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly tag = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.queryParamMap) },
  );
  protected readonly tagControl = this.formBuilder.nonNullable.control('');

  constructor() {
    effect(() => {
      const currentTag = this.tag();
      if (this.tagControl.value !== currentTag) {
        this.tagControl.setValue(currentTag, { emitEvent: false });
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
  }
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}
