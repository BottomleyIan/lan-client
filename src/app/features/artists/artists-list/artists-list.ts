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
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { combineLatest, map, shareReplay, startWith } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { ArtistsApi } from '../../../core/api/artists.api';
import type { HandlersArtistDTO } from '../../../core/api/generated/api-types';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ArtistButton, ArtistButtonModel } from '../artist-button/artist-button';

@Component({
  selector: 'app-artists-list',
  imports: [CommonModule, ScrollingModule, ArtistButton],
  templateUrl: './artists-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    role: 'listbox',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class ArtistsList {
  private readonly artistsApi = inject(ArtistsApi);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly letters = input<string>('');
  readonly selectedArtistId = input<string | null>(null);
  readonly previous = input<(() => void) | null>(null);
  readonly next = input<(() => void) | null>(null);
  readonly onArtistSelected = input<(albumId: string) => void>(() => {});

  private readonly allArtists$ = this.artistsApi.getArtists().pipe(
    map((dto) => this.mapArtists(dto)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private readonly filterPrefix = computed(() => this.letters().trim().toLowerCase());
  private readonly activeIndex = signal<number>(-1);

  protected readonly artist$ = combineLatest([
    this.allArtists$,
    toObservable(this.filterPrefix).pipe(startWith(this.filterPrefix())),
  ]).pipe(
    map(([albums, startswith]) => {
      if (!startswith) return albums;
      return albums.filter((a) => {
        const lower = (a.name ?? '').toLowerCase();
        if (lower.startsWith('the ')) {
          return lower.startsWith(`the ${startswith}`);
        }
        return lower.startsWith(startswith);
      });
    }),
  );

  protected readonly artists = toSignal(this.artist$, { initialValue: [] as ArtistButtonModel[] });

  protected readonly activeDescendantId = computed(() => {
    const album = this.artists()[this.activeIndex()];
    return album ? this.itemId(album.id) : null;
  });

  @ViewChild(CdkVirtualScrollViewport) private viewport?: CdkVirtualScrollViewport;

  constructor() {
    effect(() => {
      const incomingId = this.selectedArtistId();
      const list = this.artists();
      if (!incomingId) {
        this.activeIndex.set(-1);
        return;
      }
      const idx = list.findIndex((album) => album.id === incomingId);
      this.activeIndex.set(idx);
      if (idx >= 0) {
        this.scrollToIndex(idx);
      }
    });
  }

  protected isSelected(album: ArtistButtonModel): boolean {
    return this.selectedArtistId() === album.id;
  }

  protected trackByArtistId = (_: number, album: ArtistButtonModel): string => album.id;

  protected handleArtistSelected(albumId: string): void {
    this.onArtistSelected()(albumId);
  }

  protected itemId(id: string): string {
    return `albums-list-item-${id}`;
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
    if (key === 'ArrowLeft') {
      const previous = this.previous();
      if (previous) {
        event.preventDefault();
        previous();
      }
      return;
    }
    if (key === 'ArrowRight') {
      const next = this.next();
      if (next) {
        event.preventDefault();
        const current = this.artists()[this.activeIndex()];
        if (current) {
          this.selectArtist(current, false);
        }
        next();
      }
      return;
    }
    if (key === 'Enter' || key === ' ') {
      const current = this.artists()[this.activeIndex()];
      if (current) {
        event.preventDefault();
        this.selectArtist(current, false);
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  selectFirstArtist(): void {
    const list = this.artists();
    if (!list.length) {
      this.focus();
      return;
    }
    this.selectArtist(list[0], true);
    this.scrollToIndex(0);
  }

  private moveSelection(offset: 1 | -1): void {
    const list = this.artists();
    if (!list.length) {
      return;
    }
    const current = this.activeIndex();
    const base = current >= 0 ? current : 0;
    const nextIndex = Math.min(list.length - 1, Math.max(0, base + offset));
    const nextArtist = list[nextIndex];
    this.selectArtist(nextArtist);
    this.scrollToIndex(nextIndex);
  }

  private selectArtist(album: ArtistButtonModel, refocus = true): void {
    const list = this.artists();
    this.activeIndex.set(list.findIndex((a) => a.id === album.id));
    this.handleArtistSelected(album.id);
    if (refocus) {
      this.focus();
    }
  }

  private scrollToIndex(index: number): void {
    this.viewport?.scrollToIndex(index, 'smooth');
  }

  private mapArtists(items: HandlersArtistDTO[]): ArtistButtonModel[] {
    return items.map((a) => ({
      id: String(a.id),
      name: String(a.name),
    }));
  }
}
