import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateNoteRequest,
  HandlersNoteDTO,
  HandlersUpdateJournalEntryRequest,
} from './generated/api-types';
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

  /** POST /notes */
  createNote(body: HandlersCreateNoteRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/notes'), body);
  }

  /** PUT /notes/:year/:month/:day/:hash */
  updateNote(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
    body: HandlersUpdateJournalEntryRequest,
    options: { ifMatch: string },
  ): Observable<HandlersNoteDTO> {
    const headers = new HttpHeaders().set('If-Match', options.ifMatch);
    return this.http.put<HandlersNoteDTO>(
      apiUrl(`api/notes/${year}/${month}/${day}/${hash}`),
      body,
      { headers },
    );
  }

  /** DELETE /notes/:year/:month/:day/:hash */
  deleteNote(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
  ): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/notes/${year}/${month}/${day}/${hash}`));
  }
}
