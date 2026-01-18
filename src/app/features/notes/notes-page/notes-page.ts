import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DayView } from '../../../shared/day-view/day-view';
import { NotesTagGraph } from '../notes-tag-graph/notes-tag-graph';
import { SettingsApi } from '../../../core/api/settings.api';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { NavDropdownMenuNavItems } from '../../../ui/navbar/nav-dropdown-menu/nav-dropdown-menu';
import { NotesPageSavedTags } from '../notes-page-saved-tags/notes-page-saved-tags';
import { NotesCreateRaw } from '../notes-create-raw/notes-create-raw';
import { RecentTags } from '../recent-tags/recent-tags';
import { ContainerDivDirective } from '../../../ui/directives/container-div';
import { NotesPageAddNotesLinks } from '../notes-page-add-notes-links/notes-page-add-notes-links';
import { ImagesApi } from '../../../core/api/images.api';

@Component({
  selector: 'app-notes-page',
  imports: [
    CommonModule,
    DayView,
    NotesTagGraph,
    NotesPageSavedTags,
    NotesCreateRaw,
    RecentTags,
    ContainerDivDirective,
    NotesPageAddNotesLinks,
  ],
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
  private readonly calendarParams = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeCalendarParams(params))),
    { initialValue: normalizeCalendarParams(this.route.snapshot.paramMap) },
  );
  protected readonly hasCalendarDate = computed(() => {
    const params = this.calendarParams();
    return params !== null;
  });
  protected readonly calendarYear = computed(() => this.calendarParams()?.year ?? null);
  protected readonly calendarMonth = computed(() => this.calendarParams()?.month ?? null);
  protected readonly calendarDay = computed(() => this.calendarParams()?.day ?? null);
  protected readonly activeTag = computed(() => {
    const value = this.tag().trim();
    return value.length > 0 ? value : null;
  });
  protected readonly showDayView = computed(() => this.hasCalendarDate() || !!this.activeTag());

  private readonly settingsApi = inject(SettingsApi);
  private readonly imagesApi = inject(ImagesApi);

  private readonly tagImages = toSignal(this.imagesApi.listImages('tags'), {
    initialValue: [],
  });
  private readonly calendarImages = toSignal(this.imagesApi.listImages('calendar'), {
    initialValue: [],
  });

  protected readonly pageBackgroundImage = computed(() => {
    const tag = this.tag().trim().toLowerCase();
    if (tag) {
      const fileName = `${tag}.webp`;
      if (this.tagImages().includes(fileName)) {
        return this.imagesApi.imageUrl('tags', fileName);
      }
      return null;
    }
    const year = this.calendarYear();
    const month = this.calendarMonth();
    const day = this.calendarDay();
    if (!year || !month || !day) {
      return null;
    }
    const monthValue = String(month).padStart(2, '0');
    const dayValue = String(day).padStart(2, '0');
    const yearValue = String(year);
    const yearSpecific = `${monthValue}-${dayValue}.${yearValue}.webp`;
    const fallback = `${monthValue}-${dayValue}.webp`;
    const images = this.calendarImages().map((name) => name.toLowerCase());
    if (images.includes(yearSpecific.toLowerCase())) {
      return this.imagesApi.imageUrl('calendar', yearSpecific);
    }
    if (images.includes(fallback.toLowerCase())) {
      return this.imagesApi.imageUrl('calendar', fallback);
    }
    return null;
  });

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
      .map((tag) => ({
        name: tag,
        routerLink: '/notes',
        queryParams: { tag },
      }));
  }
  protected year(): number {
    return this.calendarYear() ?? new Date().getFullYear();
  }
  protected month(): number {
    return this.calendarMonth() ?? new Date().getMonth() + 1;
  }
  protected day(): number {
    return this.calendarDay() ?? new Date().getDate();
  }
  protected onCreated(): void {}
}

function normalizeTag(params: ParamMap): string {
  const tag = params.get('tag');
  return tag ? tag.trim() : '';
}

function normalizeCalendarParams(
  params: ParamMap,
): { year: number; month: number; day: number } | null {
  const year = toNumber(params.get('year'));
  const month = toNumber(params.get('month'));
  const day = toNumber(params.get('day'));
  if (year === null || month === null || day === null) {
    return null;
  }
  return { year, month, day };
}

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
