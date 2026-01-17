import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersTempImageDTO } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ImagesApi {
  private readonly http = inject(HttpClient);

  /** GET /images/:type */
  listImages(type: string): Observable<string[]> {
    return this.http.get<string[]>(apiUrl(`api/images/${type}`));
  }

  /** POST /images/:type */
  uploadImage(type: string, file: File): Observable<HandlersTempImageDTO> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<HandlersTempImageDTO>(apiUrl(`api/images/${type}`), form);
  }

  /** GET /images/:type/backup */
  downloadBackupUrl(type: string): string {
    return apiUrl(`api/images/${type}/backup`);
  }

  /** GET /images/:type/:name */
  imageUrl(type: string, name: string): string {
    return apiUrl(`api/images/${type}/${encodeURIComponent(name)}`);
  }
}
