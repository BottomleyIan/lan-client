import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateJournalEntryRequest,
  HandlersJournalAssetDTO,
  HandlersJournalDTO,
  HandlersJournalDayDTO,
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

  /** POST /journals */
  createJournalEntry(body: HandlersCreateJournalEntryRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/journals'), body);
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
