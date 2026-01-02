import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputDirective } from '../../../ui/directives/input';
import type { NotesNewFieldConfig } from './notes-new-config';

@Component({
  selector: 'app-notes-new-page-field',
  imports: [ReactiveFormsModule, InputDirective],
  template: `
    <label class="text-sm font-semibold text-slate-100" [for]="fieldId()">
      {{ label() }}
    </label>
    <input
      uiInput
      [id]="fieldId()"
      [type]="inputType()"
      [placeholder]="placeholder()"
      [formControl]="control()"
      [disabled]="disabled()"
    />
  `,
  host: {
    style: 'display: contents;',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesNewPageField {
  readonly field = input.required<string>();
  readonly config = input<NotesNewFieldConfig | null>(null);
  readonly control = input.required<FormControl<string>>();
  readonly disabled = input(false);

  protected readonly fieldId = computed(() => `note-field-${this.field()}`);
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
