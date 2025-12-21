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
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { PlaylistsApi } from '../../../core/api/playlists.api';
import type { HandlersPlaylistDTO } from '../../../core/api/generated/api-types';
import { PlaylistButton, type PlaylistButtonModel } from '../playlist-button/playlist-button';
import { CreatePlaylistForm } from '../create-playlist-form/create-playlist-form';
import { toObservable } from '@angular/core/rxjs-interop';
import { shareReplay, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-playlists-list',
  imports: [CommonModule, Panel, ScrollingModule, PlaylistButton, CreatePlaylistForm],
  templateUrl: './playlists-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    tabindex: '0',
    role: 'listbox',
    '[attr.aria-activedescendant]': 'activeDescendantId()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class PlaylistsList {
  private readonly playlistsApi = inject(PlaylistsApi);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly selectedPlaylistId = input.required<string>();
  readonly previous = input<(() => void) | null>(null);
  readonly next = input<(() => void) | null>(null);
  readonly onPlaylistSelected = input<(playlistId: string) => void>(() => {});

  private readonly refreshToken = signal(0);
  private readonly playlists$ = toObservable(this.refreshToken).pipe(
    startWith(0),
    switchMap(() => this.playlistsApi.getPlaylists()),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  private readonly allPlaylists = toSignal(this.playlists$, {
    initialValue: [] as HandlersPlaylistDTO[],
  });
  private readonly activeIndex = signal<number>(-1);

  protected readonly playlists = computed<PlaylistButtonModel[]>(() =>
    this.allPlaylists().map((p) => ({
      id: String(p.id),
      name: p.name ?? 'Untitled playlist',
    })),
  );

  protected readonly activeDescendantId = computed(() => {
    const playlist = this.playlists()[this.activeIndex()];
    return playlist ? this.itemId(playlist.id) : null;
  });

  @ViewChild(CdkVirtualScrollViewport) private viewport?: CdkVirtualScrollViewport;

  constructor() {
    effect(() => {
      const incomingId = this.selectedPlaylistId();
      const list = this.playlists();
      if (!incomingId) {
        this.activeIndex.set(-1);
        return;
      }
      const idx = list.findIndex((p) => p.id === incomingId);
      this.activeIndex.set(idx);
      if (idx >= 0) {
        this.scrollToIndex(idx);
      }
    });
  }

  protected isSelected(playlist: PlaylistButtonModel): boolean {
    return this.selectedPlaylistId() === playlist.id;
  }

  protected trackByPlaylistId = (_: number, playlist: PlaylistButtonModel): string => playlist.id;

  protected handlePlaylistSelected(playlistId: string): void {
    this.onPlaylistSelected()(playlistId);
  }

  protected refreshPlaylists(): void {
    this.refreshToken.update((value) => value + 1);
  }

  protected itemId(id: string): string {
    return `playlists-list-item-${id}`;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLElement) {
      const tag = event.target.tagName.toLowerCase();
      if (
        ['input', 'textarea', 'select', 'button'].includes(tag) ||
        event.target.isContentEditable
      ) {
        return;
      }
    }
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
        next();
      }
      return;
    }
    if (key === 'Enter' || key === ' ') {
      const current = this.playlists()[this.activeIndex()];
      if (current) {
        event.preventDefault();
        this.selectPlaylist(current, false);
      }
    }
  }

  focus(): void {
    this.host.nativeElement.focus();
  }

  private moveSelection(offset: 1 | -1): void {
    const list = this.playlists();
    if (!list.length) {
      return;
    }
    const current = this.activeIndex();
    const base = current >= 0 ? current : 0;
    const nextIndex = Math.min(list.length - 1, Math.max(0, base + offset));
    const nextPlaylist = list[nextIndex];
    this.selectPlaylist(nextPlaylist);
    this.scrollToIndex(nextIndex);
  }

  private selectPlaylist(playlist: PlaylistButtonModel, refocus = true): void {
    const list = this.playlists();
    this.activeIndex.set(list.findIndex((p) => p.id === playlist.id));
    this.handlePlaylistSelected(playlist.id);
    if (refocus) {
      this.focus();
    }
  }

  private scrollToIndex(index: number): void {
    this.viewport?.scrollToIndex(index, 'smooth');
  }
}
