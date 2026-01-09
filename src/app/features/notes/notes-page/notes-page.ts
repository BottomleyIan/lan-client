import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { DayView } from '../../../shared/day-view/day-view';
import { NotesTagGraph } from '../notes-tag-graph/notes-tag-graph';
import { SettingsApi } from '../../../core/api/settings.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenuNavItems } from '../../../ui/navbar/nav-dropdown-menu/nav-dropdown-menu';
import { NotesPageSavedTags } from '../notes-page-saved-tags/notes-page-saved-tags';
import { NotesCreateRaw } from '../notes-create-raw/notes-create-raw';

@Component({
  selector: 'app-notes-page',
  imports: [CommonModule, Panel, DayView, NotesTagGraph, NotesPageSavedTags, NotesCreateRaw],
  templateUrl: './notes-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly routeTag = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.paramMap) },
  );
  protected readonly tag = toSignal(
    this.route.queryParamMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.queryParamMap) },
  );

  private readonly settingsApi = inject(SettingsApi);

  protected setting = this.settingsApi.getSetting('notes-menu-tags');
  protected navItems$ = this.setting.pipe(map((s) => this.navItems(s.value ?? '')));

  constructor() {
    effect(() => {
      const queryTag = this.tag();
      const paramTag = this.routeTag();
      if (!queryTag && paramTag) {
        void this.router.navigate([], {
          queryParams: { tag: paramTag },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
  }

  protected navItems(setting: string): NavDropdownMenuNavItems[] {
    return setting
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
      .map((x) => ({ name: x, url: `notes?tag=${encodeURIComponent(x)}` }));
  }
  protected year(): number {
    return new Date().getFullYear();
  }
  protected month(): number {
    return new Date().getMonth() + 1;
  }
  protected day(): number {
    return new Date().getDate();
  }
  protected onCreated(): void {}
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}
