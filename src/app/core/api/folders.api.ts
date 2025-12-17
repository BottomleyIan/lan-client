import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersFolderDTO } from './generated/api-types';

import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class FoldersApi {
  constructor(private http: HttpClient) {}

  /** GET /folders */
  getFolders(): Observable<HandlersFolderDTO[]> {
    return this.http.get<HandlersFolderDTO[]>(apiUrl('api/folders'));
  }

  /** DELETE /folders/:id */
  deleteFolder(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/folders/${id}`));
  }

  /** POST /folders/:id/scan */
  scanFolder(id: number): Observable<void> {
    return this.http.post<void>(apiUrl(`api/folders/${id}/scan`), null);
  }
}
