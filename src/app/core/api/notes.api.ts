import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateJournalEntryRequest,
  HandlersJournalEntryDTO,
  HandlersUpdateJournalEntryRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class NotesApi {
  private readonly http = inject(HttpClient);

  /** GET /journals/entries?type=note */
  getNotes(request?: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    tag?: string;
    tags?: string[];
  }): Observable<HandlersJournalEntryDTO[]> {
    let params = new HttpParams();
    params = params.set('type', 'note');
    if (request?.year !== undefined) params = params.set('year', String(request.year));
    if (request?.month !== undefined) params = params.set('month', String(request.month));
    if (request?.day !== undefined) params = params.set('day', String(request.day));
    if (request?.tag) params = params.set('tag', request.tag);
    if (request?.tags?.length) params = params.set('tags', request.tags.join(','));
    return this.http.get<HandlersJournalEntryDTO[]>(apiUrl('api/journals/entries'), { params });
  }

  /** POST /journals/entries */
  createNote(body: HandlersCreateJournalEntryRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/journals/entries'), body);
  }

  /** PUT /journals/entries/:year/:month/:day/:hash */
  updateNote(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
    body: HandlersUpdateJournalEntryRequest,
    options: { ifMatch: string },
  ): Observable<HandlersJournalEntryDTO> {
    const headers = new HttpHeaders().set('If-Match', options.ifMatch);
    return this.http.put<HandlersJournalEntryDTO>(
      apiUrl(`api/journals/entries/${year}/${month}/${day}/${hash}`),
      body,
      { headers },
    );
  }

  /** DELETE /journals/entries/:year/:month/:day/:hash */
  deleteNote(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
  ): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/journals/entries/${year}/${month}/${day}/${hash}`));
  }
}
