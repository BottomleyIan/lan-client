import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { DayView } from '../../../shared/day-view/day-view';
import { NotesTagGraph } from '../notes-tag-graph/notes-tag-graph';
import { SettingsApi } from '../../../core/api/settings.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenuNavItems } from '../../../ui/navbar/nav-dropdown-menu/nav-dropdown-menu';
import { NotesPageSavedTags } from '../notes-page-saved-tags/notes-page-saved-tags';

@Component({
  selector: 'app-notes-page',
  imports: [CommonModule, Panel, DayView, NotesTagGraph, NotesPageSavedTags],
  templateUrl: './notes-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly tag = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.paramMap) },
  );

  private readonly settingsApi = inject(SettingsApi);

  protected setting = this.settingsApi.getSetting('notes-menu-tags');
  protected navItems$ = this.setting.pipe(map((s) => this.navItems(s.value ?? '')));

  protected navItems(setting: string): NavDropdownMenuNavItems[] {
    return setting.split(',').map((x) => ({ name: x, url: `notes/${x}` }));
  }
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}
