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
import { Panel } from '../../../ui/panel/panel';
import { AlbumsApi } from '../../../core/api/albums.api';
import { albumImageUrl } from '../../../core/api/album-image';
import type { HandlersAlbumDTO } from '../../../core/api/generated/api-types';
import { AlbumButton, type AlbumButtonModel } from '../album-button/album-button';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-albums-list',
  imports: [CommonModule, Panel, ScrollingModule, AlbumButton],
  templateUrl: './albums-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    role: 'listbox',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class AlbumsList {
  private readonly albumsApi = inject(AlbumsApi);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly letters = input<string>('');
  readonly selectedAlbumId = input<string | null>(null);
  readonly previous = input<(() => void) | null>(null);
  readonly next = input<(() => void) | null>(null);
  readonly onAlbumSelected = input<(albumId: string) => void>(() => {});

  private readonly allAlbums$ = this.albumsApi.getAlbums().pipe(
    map((dto) => this.mapAlbums(dto)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private readonly filterPrefix = computed(() => this.letters().trim().toLowerCase());
  private readonly activeIndex = signal<number>(-1);

  protected readonly albums$ = combineLatest([
    this.allAlbums$,
    toObservable(this.filterPrefix).pipe(startWith(this.filterPrefix())),
  ]).pipe(
    map(([albums, startswith]) => {
      if (!startswith) return albums;
      return albums.filter((a) => {
        const lower = (a.title ?? '').toLowerCase();
        if (lower.startsWith('the ')) {
          return lower.startsWith(`the ${startswith}`);
        }
        return lower.startsWith(startswith);
      });
    }),
  );

  protected readonly albums = toSignal(this.albums$, { initialValue: [] as AlbumButtonModel[] });

  protected readonly activeDescendantId = computed(() => {
    const album = this.albums()[this.activeIndex()];
    return album ? this.itemId(album.id) : null;
  });

  @ViewChild(CdkVirtualScrollViewport) private viewport?: CdkVirtualScrollViewport;

  constructor() {
    effect(() => {
      const incomingId = this.selectedAlbumId();
      const list = this.albums();
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

  protected isSelected(album: AlbumButtonModel): boolean {
    return this.selectedAlbumId() === album.id;
  }

  protected trackByAlbumId = (_: number, album: AlbumButtonModel): string => album.id;

  protected handleAlbumSelected(albumId: string): void {
    this.onAlbumSelected()(albumId);
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
        const current = this.albums()[this.activeIndex()];
        if (current) {
          this.selectAlbum(current, false);
        }
        next();
      }
      return;
    }
    if (key === 'Enter' || key === ' ') {
      const current = this.albums()[this.activeIndex()];
      if (current) {
        event.preventDefault();
        this.selectAlbum(current, false);
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  selectFirstAlbum(): void {
    const list = this.albums();
    if (!list.length) {
      this.focus();
      return;
    }
    this.selectAlbum(list[0], true);
    this.scrollToIndex(0);
  }

  private moveSelection(offset: 1 | -1): void {
    const list = this.albums();
    if (!list.length) {
      return;
    }
    const current = this.activeIndex();
    const base = current >= 0 ? current : 0;
    const nextIndex = Math.min(list.length - 1, Math.max(0, base + offset));
    const nextAlbum = list[nextIndex];
    this.selectAlbum(nextAlbum);
    this.scrollToIndex(nextIndex);
  }

  private selectAlbum(album: AlbumButtonModel, refocus = true): void {
    const list = this.albums();
    this.activeIndex.set(list.findIndex((a) => a.id === album.id));
    this.handleAlbumSelected(album.id);
    if (refocus) {
      this.focus();
    }
  }

  private scrollToIndex(index: number): void {
    this.viewport?.scrollToIndex(index, 'smooth');
  }

  private mapAlbums(items: HandlersAlbumDTO[]): AlbumButtonModel[] {
    return items.map((a) => ({
      id: String(a.id),
      title: String(a.title),
      artist: String(a.artist?.name || 'Unknown artist'),
      coverUrl: a.id || a.id == 0 ? albumImageUrl(a.id) : undefined,
    }));
  }
}
