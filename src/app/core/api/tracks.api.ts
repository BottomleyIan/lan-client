import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersTrackDTO,
  HandlersUpdateTrackImageRequest,
  HandlersUpdateTrackRatingRequest,
  HandlersUpdateTrackRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class TracksApi {
  constructor(private http: HttpClient) {}

  /** GET /tracks */
  getTracks(request?: {
    albumId?: number | string;
    artistId?: number | string;
    expand?: string;
    startswith?: string;
    include_unavailable?: boolean;
  }): Observable<HandlersTrackDTO[]> {
    let params = new HttpParams();
    if (request?.albumId !== undefined) params = params.set('albumId', String(request.albumId));
    if (request?.artistId !== undefined) params = params.set('artistId', String(request.artistId));
    if (request?.expand) params = params.set('expand', request.expand);
    if (request?.startswith) params = params.set('startswith', request.startswith);
    if (request?.include_unavailable !== undefined) {
      params = params.set('include_unavailable', String(request.include_unavailable));
    }
    console.log(params, request);
    return this.http.get<HandlersTrackDTO[]>(apiUrl('api/tracks'), { params });
  }

  /** GET /tracks/:id */
  getTrack(id: number | string): Observable<HandlersTrackDTO> {
    return this.http.get<HandlersTrackDTO>(apiUrl(`api/tracks/${id}`));
  }

  /** PUT /tracks/:id */
  updateTrack(id: number | string, body: HandlersUpdateTrackRequest): Observable<HandlersTrackDTO> {
    return this.http.put<HandlersTrackDTO>(apiUrl(`api/tracks/${id}`), body);
  }

  /** POST /tracks/:id/image */
  updateTrackImage(
    id: number | string,
    body: HandlersUpdateTrackImageRequest,
  ): Observable<HandlersTrackDTO> {
    return this.http.post<HandlersTrackDTO>(apiUrl(`api/tracks/${id}/image`), body);
  }
  /** PATCH /tracks/:id/image */
  updateTrackRating(
    id: number | string,
    body: HandlersUpdateTrackRatingRequest,
  ): Observable<HandlersTrackDTO> {
    return this.http.patch<HandlersTrackDTO>(apiUrl(`api/tracks/${id}/rating`), body);
  }
}
