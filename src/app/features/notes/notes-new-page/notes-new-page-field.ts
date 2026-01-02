import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputDirective } from '../../../ui/directives/input';
import type { NotesNewFieldConfig } from './notes-new-config';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap } from 'rxjs';
import { JournalsApi } from '../../../core/api/journals.api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notes-new-page-field',
  imports: [CommonModule, ReactiveFormsModule, InputDirective],
  templateUrl: './notes-new-page-field.html',
  host: {
    style: 'display: contents;',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesNewPageField {
  readonly field = input.required<string>();
  readonly config = input<NotesNewFieldConfig | null>(null);
  private readonly journalsApi = inject(JournalsApi);

  protected readonly dataList$ = combineLatest({
    field: toObservable(this.field),
    config: toObservable(this.config),
  }).pipe(
    switchMap(({ field, config }) =>
      config?.type && ['single-tag'].includes(config.type!)
        ? this.journalsApi.listPropertyKeyValues(field)
        : of([]),
    ),
  );

  readonly control = input.required<FormControl<string>>();
  readonly disabled = input(false);

  protected readonly fieldId = computed(() => `note-field-${this.field()}`);
  protected readonly datalistId = computed(() => `note-field-${this.field()}-dl`);
  protected readonly label = computed(() => this.config()?.label ?? this.field());
  protected readonly placeholder = computed(() => this.config()?.placeholder ?? '');

  protected readonly inputType = computed(() => {
    const type = this.config()?.type;
    if (type === 'calendar') {
      return 'date';
    }
    if (type === 'number') {
      return 'number';
    }
    return 'text';
  });
}
