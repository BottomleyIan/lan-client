import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { combineLatest, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import type { HandlersTrackDTO } from '../../../core/api/generated/api-types';
import { trackImageUrl } from '../../../core/api/track-image';
import { toObservable } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { TrackButton } from '../track-button/track-button';
import type { PlayerServiceTrack } from '../../../core/services/player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { TracksApi } from '../../../core/api/tracks.api';

@Component({
  selector: 'app-tracks-list',
  imports: [CommonModule, ScrollingModule, TrackButton],
  templateUrl: './tracks-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    role: 'listbox',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class TracksList {
  private readonly tracksApi = inject(TracksApi);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly albumId = input<string | null>(null);
  readonly artistId = input<string | null>(null);
  readonly albumId$ = toObservable(this.albumId).pipe(distinctUntilChanged());
  readonly artistId$ = toObservable(this.artistId).pipe(distinctUntilChanged());
  readonly filter$ = combineLatest([this.albumId$, this.artistId$]).pipe(
    map(([albumId, artistId]) => ({
      albumId: albumId || undefined,
      artistId: artistId || undefined,
    })),
  );
  readonly previous = input<(() => void) | null>(null);

  readonly tracksVm$: Observable<PlayerServiceTrack[]> = this.filter$.pipe(
    switchMap(({ artistId, albumId }) =>
      artistId || albumId
        ? this.tracksApi
            .getTracks({
              albumId,
              artistId,
              expand: artistId ? 'album' : undefined,
            })
            .pipe(map((tracks) => this.toTracksVm(tracks)))
        : of([]),
    ),
  );

  protected readonly activeIndex = signal<number>(-1);
  protected readonly tracks = toSignal(this.tracksVm$, {
    initialValue: [] as PlayerServiceTrack[],
  });
  protected readonly itemSizePx = 30;
  protected readonly activeDescendantId = computed(() => {
    const track = this.tracks()[this.activeIndex()];
    return track ? this.itemId(track.id) : null;
  });

  @ViewChild(CdkVirtualScrollViewport) private viewport?: CdkVirtualScrollViewport;

  constructor() {
    effect(() => {
      this.albumId();
      this.activeIndex.set(-1);
    });

    effect(() => {
      const list = this.tracks();
      const current = this.activeIndex();
      if (!list.length) {
        if (current !== -1) {
          this.activeIndex.set(-1);
        }
        return;
      }
      if (current >= list.length) {
        this.activeIndex.set(list.length - 1);
      }
    });
  }

  protected trackByTrackId = (_: number, track: PlayerServiceTrack): string => track.id;

  protected itemId(id: string): string {
    return `tracks-list-item-${id}`;
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      this.moveSelection(1);
      return;
    }
    if (key === 'ArrowUp') {
      event.preventDefault();
      this.moveSelection(-1);
      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      this.selectIndex(0);
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      this.selectIndex(this.tracks().length - 1);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      const current = this.tracks()[this.activeIndex()];
      if (current) {
        event.preventDefault();
        this.activateTrack(current.id);
      }
    }
    if (key === 'ArrowLeft') {
      const previous = this.previous();
      if (previous) {
        event.preventDefault();
        previous();
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  focusFirstTrack(): void {
    if (!this.tracks().length) {
      this.focus();
      return;
    }
    this.selectIndex(0);
    this.focus();
  }

  private moveSelection(offset: 1 | -1): void {
    const list = this.tracks();
    if (!list.length) {
      return;
    }
    const current = this.activeIndex();
    const base = current >= 0 ? current : 0;
    const nextIndex = Math.min(list.length - 1, Math.max(0, base + offset));
    this.selectIndex(nextIndex);
  }

  private selectIndex(index: number): void {
    const list = this.tracks();
    if (!list.length) {
      this.activeIndex.set(-1);
      return;
    }
    const safeIndex = Math.min(list.length - 1, Math.max(0, index));
    this.activeIndex.set(safeIndex);
    this.scrollToIndex(safeIndex);
  }

  private scrollToIndex(index: number): void {
    this.viewport?.scrollToIndex(index, 'smooth');
  }

  private activateTrack(trackId: string): void {
    const itemId = this.itemId(trackId);
    const button = this.host.nativeElement.querySelector(
      `#${itemId} button`,
    ) as HTMLButtonElement | null;
    button?.click();
    button?.focus();
  }

  private toTracksVm(tracks: HandlersTrackDTO[]): PlayerServiceTrack[] {
    return tracks
      .filter((t): t is HandlersTrackDTO & { id: number } => typeof t.id === 'number')
      .map(
        (t): PlayerServiceTrack => ({
          id: String(t.id),
          title: t.title?.trim() || t.filename?.trim() || 'Untitled',
          artist: t.artist?.name?.trim() || undefined,
          genre: t.genre ?? undefined,
          year: String(t.year ?? ''),
          imageUrl: trackImageUrl(t.id),
          rating: t.rating ?? 0,
          durationMs: (t?.duration_seconds ?? 0) * 1000,
        }),
      );
  }
}
