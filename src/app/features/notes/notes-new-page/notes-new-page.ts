import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import type { FormControl } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize, map } from 'rxjs';
import { JournalsApi } from '../../../core/api/journals.api';
import { FormDirective } from '../../../ui/directives/form';
import { InputDirective } from '../../../ui/directives/input';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { Panel } from '../../../ui/panel/panel';
import {
  NOTES_NEW_CONFIG,
  type NotesNewFieldConfig,
  type NotesNewTypeConfig,
} from './notes-new-config';
import { NotesNewPageField } from './notes-new-page-field';

@Component({
  selector: 'app-notes-new-page',
  imports: [
    Panel,
    ReactiveFormsModule,
    FormDirective,
    InputDirective,
    IconButtonPrimary,
    IconButtonDanger,
    NotesNewPageField,
  ],
  templateUrl: './notes-new-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesNewPage {
  private readonly journalsApi = inject(JournalsApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isSaving = signal(false);
  protected readonly entryStatuses = TASK_STATUSES;

  protected readonly entryType = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeType(params))),
    { initialValue: normalizeType(this.route.snapshot.queryParamMap) },
  );

  protected readonly activeConfig = computed<NotesNewTypeConfig | null>(() => {
    const entryType = this.entryType();
    if (!entryType) {
      return null;
    }
    return NOTES_NEW_CONFIG[entryType] ?? null;
  });

  protected readonly fieldKeys = signal<string[]>([]);
  protected readonly fields = this.formBuilder.array<FormControl<string>>([]);

  protected readonly form = this.formBuilder.nonNullable.group({
    body: ['', [Validators.required]],
    description: [''],
    tags: [''],
    status: [''],
    scheduledDate: [''],
    scheduledTime: [''],
    deadlineDate: [''],
    deadlineTime: [''],
    fields: this.fields,
  });

  protected get body(): FormControl<string> {
    return this.form.controls.body;
  }

  constructor() {
    effect(() => {
      this.applyConfig(this.activeConfig());
    });
  }

  protected submit(): void {
    const trimmedBody = this.body.value.trim();
    this.body.setValue(trimmedBody);

    if (!trimmedBody) {
      this.body.markAsTouched();
      return;
    }

    if (this.isSaving()) {
      return;
    }

    const description = this.form.controls.description.value.trim();
    const tags = this.parseTags(this.form.controls.tags.value);
    const status = this.form.controls.status.value.trim();
    const scheduledDate = this.form.controls.scheduledDate.value.trim();
    const scheduledTime = this.form.controls.scheduledTime.value.trim();
    const deadlineDate = this.form.controls.deadlineDate.value.trim();
    const deadlineTime = this.form.controls.deadlineTime.value.trim();
    const scheduled = toIsoOrDate(scheduledDate, scheduledTime);
    const deadline = toIsoOrDate(deadlineDate, deadlineTime);
    const targetDate = toCalendarDate(scheduledDate);
    const finalBody = this.composeBody(trimmedBody);

    this.isSaving.set(true);

    this.journalsApi
      .createJournalEntry({
        body: finalBody,
        description: description || undefined,
        tags: tags.length ? tags : undefined,
        status: status || undefined,
        scheduled: scheduled || undefined,
        deadline: deadline || undefined,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset({
            body: '',
            description: '',
            tags: '',
            status: '',
            scheduledDate: '',
            scheduledTime: '',
            deadlineDate: '',
            deadlineTime: '',
          });
          this.applyConfig(this.activeConfig());
          void this.router.navigate([
            '/calendar',
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
            targetDate.getDate(),
          ]);
        },
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/notes']);
  }

  protected handleEntryToggle(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement)) {
      return;
    }
    if (!target.open) {
      this.form.controls.status.setValue('');
      this.form.controls.scheduledDate.setValue('');
      this.form.controls.scheduledTime.setValue('');
      this.form.controls.deadlineDate.setValue('');
      this.form.controls.deadlineTime.setValue('');
    }
  }

  protected fieldControl(index: number): FormControl<string> {
    return this.fields.at(index) as FormControl<string>;
  }

  protected fieldConfig(field: string): NotesNewFieldConfig | null {
    return this.activeConfig()?.fields?.[field] ?? null;
  }

  private parseTags(rawTags: string): string[] {
    return rawTags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  private applyConfig(config: NotesNewTypeConfig | null): void {
    const tags = config?.tags ?? [];
    const fieldKeys = Object.keys(config?.fields ?? {});

    this.fieldKeys.set(fieldKeys);
    this.fields.clear();
    fieldKeys.forEach((field) => {
      const fieldConfig = config?.fields?.[field];
      const defaultValue =
        fieldConfig?.default ?? (fieldConfig?.type === 'calendar' ? todayDateValue() : '');
      this.fields.push(this.formBuilder.nonNullable.control(defaultValue));
    });
    this.form.controls.tags.setValue(tags.join(', '));
  }

  private composeBody(body: string): string {
    const fieldKeys = this.fieldKeys();
    const fieldValues = this.fields.getRawValue();
    const fieldLines = fieldKeys
      .map((field, index) => {
        const value = fieldValues[index]?.trim() ?? '';
        if (!value) {
          return '';
        }
        const formattedValue = formatFieldValue(this.fieldConfig(field), value);
        return `${field}:: ${formattedValue}`;
      })
      .filter((line) => line.length > 0);

    if (fieldLines.length === 0) {
      return body;
    }

    return `${fieldLines.join('\n')}\n\n${body}`;
  }
}

const TASK_STATUSES = [
  'LATER',
  'NOW',
  'DONE',
  'TODO',
  'DOING',
  'CANCELLED',
  'IN-PROGRESS',
  'WAITING',
] as const;

function toIsoOrDate(dateValue: string, timeValue: string): string {
  if (!dateValue) {
    return '';
  }
  if (!timeValue) {
    return dateValue;
  }
  const iso = new Date(`${dateValue}T${timeValue}`).toJSON();
  return iso ?? dateValue;
}

function toCalendarDate(dateValue: string): Date {
  if (dateValue) {
    const [year, month, day] = dateValue.split('-').map((value) => Number(value));
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return new Date(year, month - 1, day);
    }
  }
  return new Date();
}

function normalizeType(params: ParamMap): string {
  const type = params.get('type');
  return type ? type.trim() : '';
}

function formatFieldValue(config: NotesNewFieldConfig | null, value: string): string {
  if (!config?.type) {
    return value;
  }
  if (config.type === 'multiple-tag') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .map((entry) => `[[${entry}]]`)
      .join(' ');
  }
  return `[[${value}]]`;
}

function todayDateValue(): string {
  return new Date().toISOString().slice(0, 10);
}
