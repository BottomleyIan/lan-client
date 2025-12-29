import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersNoteDTO } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class NotesApi {
  private readonly http = inject(HttpClient);

  /** GET /notes */
  getNotes(request?: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    tag?: string;
  }): Observable<HandlersNoteDTO[]> {
    let params = new HttpParams();
    if (request?.year !== undefined) params = params.set('year', String(request.year));
    if (request?.month !== undefined) params = params.set('month', String(request.month));
    if (request?.day !== undefined) params = params.set('day', String(request.day));
    if (request?.tag) params = params.set('tag', request.tag);
    return this.http.get<HandlersNoteDTO[]>(apiUrl('api/notes'), { params });
  }
}
