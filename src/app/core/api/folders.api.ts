import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateFolderRequest,
  HandlersFolderDTO,
  HandlersScanDTO,
} from './generated/api-types';

import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class FoldersApi {
  constructor(private http: HttpClient) {}

  /** GET /folders */
  getFolders(): Observable<HandlersFolderDTO[]> {
    return this.http.get<HandlersFolderDTO[]>(apiUrl('api/folders'));
  }

  /** GET /folders/:id */
  getFolder(id: number): Observable<HandlersFolderDTO> {
    return this.http.get<HandlersFolderDTO>(apiUrl(`api/folders/${id}`));
  }

  /** DELETE /folders/:id */
  deleteFolder(id: number): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/folders/${id}`));
  }

  /** POST /folders/:id/scan */
  scanFolder(id: number): Observable<void> {
    return this.http.post<void>(apiUrl(`api/folders/${id}/scan`), null);
  }

  /** POST /folders */
  createFolder(body: HandlersCreateFolderRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/folders'), body);
  }

  /** GET /folders/:id/scan */
  getScan(id: number): Observable<HandlersScanDTO> {
    return this.http.get<HandlersScanDTO>(apiUrl(`api/folders/${id}/scan`));
  }
}
