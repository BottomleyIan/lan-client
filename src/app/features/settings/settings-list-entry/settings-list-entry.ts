import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SettingListEntryVm = {
  id: string;
  key: string;
  value: string;
  description?: string;
  exists: boolean;
};

@Component({
  selector: 'app-settings-list-entry',
  imports: [CommonModule],
  templateUrl: './settings-list-entry.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsListEntry {
  readonly setting = input.required<SettingListEntryVm>();
  readonly isSaving = input(false);
  readonly draftValue = input('');
  readonly draftChange = output<string>();
  readonly inputBlur = output<void>();

  protected handleInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.draftChange.emit(target.value);
  }

  protected handleBlur(): void {
    this.inputBlur.emit();
  }
}
