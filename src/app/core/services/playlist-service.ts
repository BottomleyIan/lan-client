// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HandlersPlaylistDTO, HandlersPlaylistTrackDTO } from '../api/generated/api-types';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistsApi } from '../api/playlists.api';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private activePlaylistIdSubject = new BehaviorSubject<number | null>(1);
  readonly activePlaylistId$ = this.activePlaylistIdSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  private readonly refreshTracksSubject = new Subject<void>();
  readonly refreshTracks$ = this.refreshTracksSubject.asObservable();

  private readonly refreshPlaylistsSubject = new Subject<void>();
  readonly refreshPlaylists$ = this.refreshPlaylistsSubject.asObservable();

  // playlist (unchanged from before)
  readonly activePlaylist$: Observable<HandlersPlaylistDTO | null> = this.activePlaylistId$.pipe(
    switchMap((playlistId) =>
      playlistId == null
        ? of(null)
        : this.playlistsApi.getPlaylist(playlistId).pipe(
            catchError((err) => {
              console.error('Failed to load playlist', err);
              return of(null);
            }),
          ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  // tracks: refetch when playlistId changes OR when refreshTracksSubject emits
  readonly activePlaylistTracks$: Observable<HandlersPlaylistTrackDTO[]> = combineLatest([
    this.activePlaylistId$,
    this.refreshTracks$.pipe(
      // make combineLatest emit immediately without waiting for first refresh
      map(() => true),
      // start with an initial "true" without importing startWith (simple trick):
    ),
  ]).pipe(
    map(([playlistId]) => playlistId),
    switchMap((playlistId) => {
      if (playlistId == null) return of([]);

      return this.playlistsApi.getPlaylistTracks(playlistId).pipe(
        map((tracks) =>
          [...tracks].sort(
            (a, b) =>
              (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER),
          ),
        ),
        catchError((err) => {
          console.error('Failed to load playlist tracks', err);
          return of([]);
        }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  constructor(private playlistsApi: PlaylistsApi) {
    // kick off the combineLatest immediately
    queueMicrotask(() => this.refreshTracksSubject.next());
  }

  setActivePlaylist(playlistId: number | null): void {
    this.activePlaylistIdSubject.next(playlistId);
    this.refreshTracksSubject.next(); // load immediately
  }

  refreshPlaylists(): void {
    this.refreshPlaylistsSubject.next();
  }

  enqueue(trackId: number | string): Observable<HandlersPlaylistTrackDTO> {
    const playlistId = this.activePlaylistIdSubject.value;
    if (playlistId == null) {
      return throwError(() => new Error('No active playlist selected'));
    }
    let trackIdNum: number;

    try {
      const rawPlaylistId = this.activePlaylistIdSubject.value;
      if (rawPlaylistId == null) {
        return throwError(() => new Error('No active playlist selected'));
      }

      trackIdNum = this.toNumberId(trackId, 'trackId');
    } catch (e) {
      return throwError(() => (e instanceof Error ? e : new Error('Invalid id')));
    }
    return this.playlistsApi
      .addPlaylistTrack(playlistId, { track_id: trackIdNum })
      .pipe(tap(() => this.refreshTracksSubject.next()));
  }
  private toNumberId(value: number | string, name: string): number {
    const n = typeof value === 'number' ? value : Number(value);
    // reject NaN, Infinity, 0/negative if your ids are positive
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      throw new Error(`${name} must be a positive integer. Got: ${value}`);
    }
    return n;
  }
}
