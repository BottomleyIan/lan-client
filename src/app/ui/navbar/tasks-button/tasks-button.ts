import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenu, NavDropdownMenuNavItems } from '../nav-dropdown-menu/nav-dropdown-menu';
import { map } from 'rxjs';
import { SettingsApi } from '../../../core/api/settings.api';
import { AsyncPipe } from '@angular/common';
import { NavLink } from '../../nav-link/nav-link';

@Component({
  selector: 'app-tasks-button',
  imports: [NavDropdownMenu, AsyncPipe, NavLink],
  templateUrl: './tasks-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTasksButton {
  private readonly settingsApi = inject(SettingsApi);

  protected setting = this.settingsApi.getSetting('notes-menu-tags');
  protected navItems$ = this.setting.pipe(map((s) => this.navItems(s.value ?? '')));

  protected navItems(setting: string): NavDropdownMenuNavItems[] {
    return [
      { name: 'All', url: 'tasks' },
      ...setting.split(',').map((x) => ({ name: x, url: `tasks?tag=${x}` })),
    ];
  }
}
