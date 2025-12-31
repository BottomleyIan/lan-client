import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateJournalEntryRequest,
  HandlersJournalAssetDTO,
  HandlersJournalDTO,
  HandlersJournalDayDTO,
  HandlersJournalEntryDTO,
  HandlersTagGraphDTO,
  HandlersUpdateJournalEntryRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class JournalsApi {
  private readonly http = inject(HttpClient);

  /** GET /journals/:year/:month */
  getJournals(
    year: number,
    month: number,
    options?: { refresh?: boolean },
  ): Observable<HandlersJournalDTO[]> {
    const params =
      options?.refresh !== undefined
        ? new HttpParams().set('refresh', String(options.refresh))
        : undefined;
    return this.http.get<HandlersJournalDTO[]>(apiUrl(`api/journals/${year}/${month}`), { params });
  }

  /** GET /journals */
  listJournals(request?: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    tag?: string;
  }): Observable<HandlersJournalDTO[]> {
    let params = new HttpParams();
    if (request?.year !== undefined) params = params.set('year', String(request.year));
    if (request?.month !== undefined) params = params.set('month', String(request.month));
    if (request?.day !== undefined) params = params.set('day', String(request.day));
    if (request?.tag) params = params.set('tag', request.tag);
    return this.http.get<HandlersJournalDTO[]>(apiUrl('api/journals'), { params });
  }

  /** GET /journals/entries */
  listEntries(request?: {
    year?: number | string;
    month?: number | string;
    day?: number | string;
    type?: string;
    statuses?: string[];
    status?: string[];
    tags?: string[];
    tag?: string[];
  }): Observable<HandlersJournalEntryDTO[]> {
    let params = new HttpParams();
    if (request?.year !== undefined) params = params.set('year', String(request.year));
    if (request?.month !== undefined) params = params.set('month', String(request.month));
    if (request?.day !== undefined) params = params.set('day', String(request.day));
    if (request?.type) params = params.set('type', request.type);
    if (request?.statuses?.length) params = params.set('statuses', request.statuses.join(','));
    if (request?.status?.length) params = params.set('status', request.status.join(','));
    if (request?.tags?.length) params = params.set('tags', request.tags.join(','));
    if (request?.tag?.length) params = params.set('tag', request.tag.join(','));
    return this.http.get<HandlersJournalEntryDTO[]>(apiUrl('api/journals/entries'), { params });
  }

  /** GET /journals/:year/:month/:day */
  getJournalDay(year: number, month: number, day: number): Observable<HandlersJournalDayDTO> {
    return this.http.get<HandlersJournalDayDTO>(apiUrl(`api/journals/${year}/${month}/${day}`));
  }

  /** GET /journals/tags */
  listTags(startswith?: string): Observable<string[]> {
    const params = startswith ? new HttpParams().set('startswith', startswith) : undefined;
    return this.http.get<string[]>(apiUrl('api/journals/tags'), { params });
  }

  /** GET /journals/assets */
  getAsset(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.http.get(apiUrl('api/journals/assets'), { params, responseType: 'blob' });
  }

  /** GET /journals/tags/graph/:tag */
  getTagGraph(tag: string): Observable<HandlersTagGraphDTO> {
    return this.http.get<HandlersTagGraphDTO>(apiUrl(`api/journals/tags/graph/${tag}`));
  }

  /** POST /journals/entries */
  createJournalEntry(body: HandlersCreateJournalEntryRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/journals/entries'), body);
  }

  /** PUT /journals/entries/:year/:month/:day/:hash */
  updateJournalEntry(
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
  deleteJournalEntry(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
  ): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/journals/entries/${year}/${month}/${day}/${hash}`));
  }

  /** POST /journals/assets */
  uploadAsset(file: File, options?: { filename?: string }): Observable<HandlersJournalAssetDTO> {
    const formData = new FormData();
    formData.append('file', file);
    const params = options?.filename
      ? new HttpParams().set('filename', options.filename)
      : undefined;
    return this.http.post<HandlersJournalAssetDTO>(apiUrl('api/journals/assets'), formData, {
      params,
    });
  }
}
