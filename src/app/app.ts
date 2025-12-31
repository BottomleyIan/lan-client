import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './ui/navbar/navbar';
import { CurrentlyPlaying } from './shared/currently-playing/currently-playing';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerEngineService } from './core/services/player-engine-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from './core/services/player-facade';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CurrentlyPlaying],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('musicclient');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly routeSnapshot = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.snapshot),
    ),
    { initialValue: this.route.snapshot },
  );

  protected readonly navTitle = computed(() => {
    const active = getActiveRoute(this.routeSnapshot());
    const value = active?.data?.['navTitle'];
    return typeof value === 'string' && value.trim().length > 0 ? value : DEFAULT_NAV_TITLE;
  });

  protected readonly navSubtitle = computed(() => {
    const active = getActiveRoute(this.routeSnapshot());
    const paramKey = active?.data?.['navSubtitleParam'];
    if (typeof paramKey === 'string') {
      const paramValue = active?.paramMap?.get(paramKey);
      if (paramValue && paramValue.trim().length > 0) {
        return paramValue;
      }
    }
    const value = active?.data?.['navSubtitle'];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return this.navTitle() === DEFAULT_NAV_TITLE ? DEFAULT_NAV_SUBTITLE : '';
  });

  protected readonly navTitleMode = computed(() => {
    const active = getActiveRoute(this.routeSnapshot());
    const value = active?.data?.['navTitleMode'];
    if (value === 'calendar-month' || value === 'calendar-day') {
      return value;
    }
    return 'default';
  });

  constructor(_engine: PlayerEngineService, playlist: PlayerFacade) {
    playlist.setActivePlaylist$(1).subscribe();
  }
}

const DEFAULT_NAV_TITLE = 'LAN Music';
const DEFAULT_NAV_SUBTITLE = 'client';

function getActiveRoute(route: ActivatedRoute['snapshot']): ActivatedRoute['snapshot'] | null {
  let current: ActivatedRoute['snapshot'] | null = route;
  while (current?.firstChild) {
    current = current.firstChild;
  }
  return current;
}
