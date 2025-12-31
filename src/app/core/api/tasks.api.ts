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
export class TasksApi {
  private readonly http = inject(HttpClient);

  /** GET /journals/entries?type=task */
  getTasks(request?: {
    statuses?: string[];
    status?: string[];
    tags?: string[];
    year?: number | string;
    month?: number | string;
    day?: number | string;
  }): Observable<HandlersJournalEntryDTO[]> {
    let params = new HttpParams();
    params = params.set('type', 'task');
    if (request?.statuses?.length) {
      params = params.set('statuses', request.statuses.join(','));
    }
    if (request?.status?.length) {
      params = params.set('status', request.status.join(','));
    }
    if (request?.tags?.length) {
      params = params.set('tags', request.tags.join(','));
    }
    if (request?.year !== undefined) {
      params = params.set('year', String(request.year));
    }
    if (request?.month !== undefined) {
      params = params.set('month', String(request.month));
    }
    if (request?.day !== undefined) {
      params = params.set('day', String(request.day));
    }
    return this.http.get<HandlersJournalEntryDTO[]>(apiUrl('api/journals/entries'), { params });
  }

  /** POST /journals/entries */
  createTask(body: HandlersCreateJournalEntryRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/journals/entries'), body);
  }

  /** PUT /journals/entries/:year/:month/:day/:hash */
  updateTask(
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
  deleteTask(
    year: number | string,
    month: number | string,
    day: number | string,
    hash: string,
  ): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/journals/entries/${year}/${month}/${day}/${hash}`));
  }
}
