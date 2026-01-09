import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { SettingsApi } from '../../../core/api/settings.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenuNavItems } from '../../../ui/navbar/nav-dropdown-menu/nav-dropdown-menu';

@Component({
  selector: 'app-notes-page-saved-tags',
  imports: [CommonModule],
  templateUrl: './notes-page-saved-tags.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPageSavedTags {
  readonly title = input.required<string>();
  readonly setting = input.required<string>();
  private readonly settingsApi = inject(SettingsApi);

  protected navItems$ = toObservable(this.setting).pipe(
    switchMap((s) => this.settingsApi.getSetting(s)),
    map((s) => this.navItems(s.value ?? '')),
  );

  protected navItems(setting: string): NavDropdownMenuNavItems[] {
    return setting
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .map((x) => ({ name: x, url: `notes?tag=${encodeURIComponent(x)}` }));
  }
}
