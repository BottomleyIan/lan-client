import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersAlbumDTO } from './generated/api-types';

import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class AlbumsApi {
  constructor(private http: HttpClient) {}

  /** GET /albums */
  getAlbums(request?: { startswith?: string }): Observable<HandlersAlbumDTO[]> {
    const params = request?.startswith ? { startswith: request.startswith } : undefined;
    return this.http.get<HandlersAlbumDTO[]>(apiUrl('api/albums'), { params });
  }

  /** GET /albums/:id */
  getAlbum(id: string | number): Observable<HandlersAlbumDTO> {
    return this.http.get<HandlersAlbumDTO>(apiUrl(`api/albums/${id}`));
  }
}
