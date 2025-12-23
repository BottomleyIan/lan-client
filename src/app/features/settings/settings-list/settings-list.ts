import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, finalize, map, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type {
  HandlersSettingDTO,
  HandlersSettingKeyDTO,
} from '../../../core/api/generated/api-types';
import { SettingsApi } from '../../../core/api/settings.api';
import {
  SettingsListEntry,
  type SettingListEntryVm,
} from '../settings-list-entry/settings-list-entry';

@Component({
  selector: 'app-settings-list',
  imports: [CommonModule, SettingsListEntry],
  templateUrl: './settings-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsList {
  private readonly settingsApi = inject(SettingsApi);
  private readonly refresh$ = new Subject<void>();
  private readonly savingKeys = signal<Set<string>>(new Set());
  private readonly drafts = signal<Map<string, string>>(new Map());

  protected readonly settings$: Observable<SettingListEntryVm[]> = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() =>
      combineLatest([this.settingsApi.getSettings(), this.settingsApi.getSettingKeys()]),
    ),
    map(([settings, keys]) => this.mapSettings(settings, keys)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private mapSettings(
    settings: HandlersSettingDTO[],
    keys: HandlersSettingKeyDTO[],
  ): SettingListEntryVm[] {
    const settingsByKey = new Map(
      settings.filter((setting) => setting.key).map((setting) => [setting.key as string, setting]),
    );
    const usedKeys = new Set<string>();
    const entries = keys
      .filter((entry) => entry.key)
      .map((entry, index) => {
        const key = entry.key ?? `setting-${index}`;
        const setting = settingsByKey.get(key);
        usedKeys.add(key);
        return {
          id: key,
          key,
          value: setting?.value ?? '',
          description: entry.description ?? undefined,
          exists: Boolean(setting),
        };
      });

    const extraEntries = settings
      .filter((setting) => setting.key && !usedKeys.has(setting.key))
      .map((setting, index) => {
        const key = setting.key ?? `setting-extra-${index}`;
        return {
          id: key,
          key,
          value: setting.value ?? '',
          description: undefined,
          exists: true,
        };
      });

    const mapped = [...entries, ...extraEntries];
    this.seedDrafts(mapped);
    return mapped;
  }

  protected isSaving(key: string): boolean {
    return this.savingKeys().has(key);
  }

  protected draftFor(setting: SettingListEntryVm): string {
    return this.drafts().get(setting.key) ?? setting.value ?? '';
  }

  protected updateDraft(setting: SettingListEntryVm, value: string): void {
    const next = new Map(this.drafts());
    next.set(setting.key, value);
    this.drafts.set(next);
  }

  protected handleBlur(setting: SettingListEntryVm): void {
    const draft = this.draftFor(setting);
    const current = setting.value ?? '';
    if (draft === current) {
      return;
    }
    this.saveSetting(setting, draft);
  }

  private seedDrafts(settings: SettingListEntryVm[]): void {
    const next = new Map(this.drafts());
    for (const setting of settings) {
      if (!next.has(setting.key)) {
        next.set(setting.key, setting.value ?? '');
      }
    }
    this.drafts.set(next);
  }

  private saveSetting(setting: SettingListEntryVm, value: string): void {
    if (!setting.key || this.isSaving(setting.key)) {
      return;
    }

    const nextSaving = new Set(this.savingKeys());
    nextSaving.add(setting.key);
    this.savingKeys.set(nextSaving);

    const request$ = setting.exists
      ? this.settingsApi.updateSetting(setting.key, { value })
      : this.settingsApi.createSetting({ key: setting.key, value });

    request$
      .pipe(
        finalize(() => {
          const cleared = new Set(this.savingKeys());
          cleared.delete(setting.key);
          this.savingKeys.set(cleared);
        }),
      )
      .subscribe({
        next: () => {
          const nextDrafts = new Map(this.drafts());
          nextDrafts.set(setting.key, value);
          this.drafts.set(nextDrafts);
          this.refresh$.next();
        },
        error: (err) => console.error('Failed to save setting', err),
      });
  }
}
