import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersAddPlaylistTrackRequest,
  HandlersCreatePlaylistRequest,
  HandlersEnqueuePlaylistTrackRequest,
  HandlersPlaylistDTO,
  HandlersPlaylistTrackDTO,
  HandlersUpdatePlaylistTrackRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class PlaylistsApi {
  constructor(private http: HttpClient) {}

  /** GET /playlists */
  getPlaylists(): Observable<HandlersPlaylistDTO[]> {
    return this.http.get<HandlersPlaylistDTO[]>(apiUrl('api/playlists'));
  }

  /** POST /playlists */
  createPlaylist(body: HandlersCreatePlaylistRequest): Observable<HandlersPlaylistDTO> {
    return this.http.post<HandlersPlaylistDTO>(apiUrl('api/playlists'), body);
  }

  /** GET /playlists/:id */
  getPlaylist(id: number | string): Observable<HandlersPlaylistDTO> {
    return this.http.get<HandlersPlaylistDTO>(apiUrl(`api/playlists/${id}`));
  }

  /** PUT /playlists/:id */
  updatePlaylist(
    id: number | string,
    body: HandlersCreatePlaylistRequest,
  ): Observable<HandlersPlaylistDTO> {
    return this.http.put<HandlersPlaylistDTO>(apiUrl(`api/playlists/${id}`), body);
  }

  /** DELETE /playlists/:id */
  deletePlaylist(id: number | string): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/playlists/${id}`));
  }

  /** POST /playlists/:id/clear */
  clearPlaylist(id: number | string): Observable<void> {
    return this.http.post<void>(apiUrl(`api/playlists/${id}/clear`), null);
  }

  /** POST /playlists/:id/enqueue */
  enqueueTrack(
    id: number | string,
    body: HandlersEnqueuePlaylistTrackRequest,
  ): Observable<HandlersPlaylistTrackDTO> {
    return this.http.post<HandlersPlaylistTrackDTO>(apiUrl(`api/playlists/${id}/enqueue`), body);
  }

  /** GET /playlists/:id/tracks */
  getPlaylistTracks(id: number | string): Observable<HandlersPlaylistTrackDTO[]> {
    return this.http.get<HandlersPlaylistTrackDTO[]>(apiUrl(`api/playlists/${id}/tracks`));
  }

  /** POST /playlists/:id/tracks */
  addPlaylistTrack(
    id: number | string,
    body: HandlersAddPlaylistTrackRequest,
  ): Observable<HandlersPlaylistTrackDTO> {
    return this.http.post<HandlersPlaylistTrackDTO>(apiUrl(`api/playlists/${id}/tracks`), body);
  }

  /** PUT /playlists/:id/tracks/:track_id */
  updatePlaylistTrack(
    id: number | string,
    trackId: number | string,
    body: HandlersUpdatePlaylistTrackRequest,
  ): Observable<HandlersPlaylistTrackDTO> {
    return this.http.put<HandlersPlaylistTrackDTO>(
      apiUrl(`api/playlists/${id}/tracks/${trackId}`),
      body,
    );
  }

  /** DELETE /playlists/:id/tracks/:track_id */
  deletePlaylistTrack(id: number | string, trackId: number | string): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/playlists/${id}/tracks/${trackId}`));
  }
}
