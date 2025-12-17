import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersAlbumDTO,
  HandlersTrackDTO,
  HandlersUpdateAlbumRequest,
} from './generated/api-types';

import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class AlbumsApi {
  constructor(private http: HttpClient) {}

  /** GET /albums */
  getAlbums(request?: {
    startswith?: string;
    include_unavailable?: boolean;
  }): Observable<HandlersAlbumDTO[]> {
    let params = new HttpParams();
    if (request?.startswith) params = params.set('startswith', request.startswith);
    if (request?.include_unavailable !== undefined) {
      params = params.set('include_unavailable', String(request.include_unavailable));
    }
    return this.http.get<HandlersAlbumDTO[]>(apiUrl('api/albums'), { params });
  }

  /** GET /albums/:id */
  getAlbum(id: string | number): Observable<HandlersAlbumDTO> {
    return this.http.get<HandlersAlbumDTO>(apiUrl(`api/albums/${id}`));
  }

  /** PUT /albums/:id */
  updateAlbum(id: string | number, body: HandlersUpdateAlbumRequest): Observable<HandlersAlbumDTO> {
    return this.http.put<HandlersAlbumDTO>(apiUrl(`api/albums/${id}`), body);
  }

  /** DELETE /albums/:id */
  deleteAlbum(id: string | number): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/albums/${id}`));
  }

  /** GET /albums/:id/tracks */
  getAlbumTracks(
    id: string | number,
    request?: { expand?: string; startswith?: string; include_unavailable?: boolean },
  ): Observable<HandlersTrackDTO[]> {
    let params = new HttpParams();
    if (request?.expand) params = params.set('expand', request.expand);
    if (request?.startswith) params = params.set('startswith', request.startswith);
    if (request?.include_unavailable !== undefined) {
      params = params.set('include_unavailable', String(request.include_unavailable));
    }
    return this.http.get<HandlersTrackDTO[]>(apiUrl(`api/albums/${id}/tracks`), { params });
  }
}
