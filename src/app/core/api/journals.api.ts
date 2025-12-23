import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateJournalEntryRequest,
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

  /** GET /journals/:year/:month/:day */
  getJournalDay(year: number, month: number, day: number): Observable<HandlersJournalDayDTO> {
    return this.http.get<HandlersJournalDayDTO>(apiUrl(`api/journals/${year}/${month}/${day}`));
  }

  /** POST /journals */
  createJournalEntry(body: HandlersCreateJournalEntryRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/journals'), body);
  }
}
