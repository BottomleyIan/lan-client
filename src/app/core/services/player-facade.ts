import { Injectable } from '@angular/core';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HandlersPlaylistTrackDTO } from '../api/generated/api-types';
import { trackImageUrl } from '../api/track-image';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService, PlayerServiceTrack } from './player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlaylistService } from './playlist-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Observable, combineLatest, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerFacade {
  constructor(
    private playlist: PlaylistService,
    private player: PlayerService,
  ) {
    this.playlist.activePlaylistTracks$
      .pipe(map((pts) => pts.map((pt) => this.mapPlaylistTrackToPlayerTrack(pt))))
      .subscribe((queue) => {
        this.player.setQueue(queue, { autoplay: false });
      });
    this.setPlaylistAndPlay$(2);
  }

  setActivePlaylist$(playlistId: number | string): Observable<void> {
    const id = typeof playlistId === 'string' ? Number(playlistId) : playlistId;
    this.playlist.setActivePlaylist(id);
    return this.player.queue$.pipe(
      // wait until the sync subscription has populated the queue
      filter((q) => q.length > 0),
      map(() => void 0),
    );
  }

  setPlaylistAndPlay$(playlistId: number | string): Observable<void> {
    const id = typeof playlistId === 'string' ? Number(playlistId) : playlistId;

    this.playlist.setActivePlaylist(id);

    return this.player.queue$.pipe(
      // wait until the sync subscription has populated the queue
      filter((q) => q.length > 0),
      take(1),
      tap(() => {
        console.log('play');
        this.player.playAt(0);
      }), // or this.player.play()
      map(() => void 0),
    );
  }

  enqueueAndPlay$(trackId: number | string): Observable<number> {
    const targetId = String(trackId);

    return this.playlist.activePlaylistTracks$.pipe(
      take(1),
      switchMap((pts) => {
        const existingIndex = pts.findIndex(
          (pt) => String(pt.track?.id ?? pt.track_id ?? '') === targetId,
        );

        if (existingIndex >= 0) {
          this.player.playAt(existingIndex);
          return of(existingIndex);
        }

        // Not present: POST then wait for refresh to include it
        return this.playlist.enqueue(trackId).pipe(
          switchMap((created) => {
            const createdTrackId = String(created.track?.id ?? created.track_id ?? '');

            return this.playlist.activePlaylistTracks$.pipe(
              map((list) =>
                list.findIndex(
                  (pt) => String(pt.track?.id ?? pt.track_id ?? '') === createdTrackId,
                ),
              ),
              filter((idx) => idx >= 0),
              take(1),
              tap((idx) => this.player.playAt(idx)),
            );
          }),
        );
      }),
      catchError((err) => {
        // no console.log here unless you also want it
        return throwError(() => err);
      }),
    );
  }

  enqueueToEnd$(trackId: number | string): Observable<void> {
    const targetId = String(trackId);
    return combineLatest([this.player.isPlaying$, this.playlist.activePlaylistTracks$]).pipe(
      take(1),
      switchMap(([isPlaying, playlistTracks]) => {
        const existingIndex = playlistTracks.findIndex(
          (pt) => String(pt.track?.id ?? pt.track_id ?? '') === targetId,
        );
        if (existingIndex >= 0) {
          if (!isPlaying) {
            this.player.playAt(existingIndex);
          }
          return of(void 0);
        }
        return this.playlist.enqueue(trackId).pipe(
          switchMap((created) => {
            if (isPlaying) {
              return of(void 0);
            }
            const createdTrackId = String(created.track?.id ?? created.track_id ?? '');
            return this.playlist.activePlaylistTracks$.pipe(
              map((list) =>
                list.findIndex(
                  (pt) => String(pt.track?.id ?? pt.track_id ?? '') === createdTrackId,
                ),
              ),
              filter((idx) => idx >= 0),
              take(1),
              tap((idx) => this.player.playAt(idx)),
              map(() => void 0),
            );
          }),
        );
      }),
    );
  }

  private mapPlaylistTrackToPlayerTrack(pt: HandlersPlaylistTrackDTO): PlayerServiceTrack {
    const t = pt.track;
    return {
      id: String(t?.id ?? ''),
      title: t?.title?.trim() || t?.filename?.trim() || 'Untitled',
      artist: t?.artist?.name?.trim() || undefined,
      album: t?.album || undefined,
      genre: t?.genre ?? undefined,
      year: String(t?.year ?? ''),
      imageUrl: t?.id ? trackImageUrl(t?.id) : undefined,
      rating: t?.rating ?? 0,
      durationMs: (t?.duration_seconds ?? 0) * 1000,
    };
  }
}
