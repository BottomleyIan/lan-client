import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersArtistDTO, HandlersUpdateArtistRequest } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ArtistsApi {
  constructor(private http: HttpClient) {}

  /** GET /artists */
  getArtists(request?: { startswith?: string }): Observable<HandlersArtistDTO[]> {
    const params = request?.startswith
      ? new HttpParams().set('startswith', request.startswith)
      : undefined;
    return this.http.get<HandlersArtistDTO[]>(apiUrl('api/artists'), { params });
  }

  /** GET /artists/:id */
  getArtist(id: string | number): Observable<HandlersArtistDTO> {
    return this.http.get<HandlersArtistDTO>(apiUrl(`api/artists/${id}`));
  }

  /** PUT /artists/:id */
  updateArtist(
    id: string | number,
    body: HandlersUpdateArtistRequest,
  ): Observable<HandlersArtistDTO> {
    return this.http.put<HandlersArtistDTO>(apiUrl(`api/artists/${id}`), body);
  }

  /** DELETE /artists/:id */
  deleteArtist(id: string | number): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/artists/${id}`));
  }
}
