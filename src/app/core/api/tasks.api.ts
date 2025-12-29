import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersCreateLogseqTaskRequest, HandlersTaskDTO } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  private readonly http = inject(HttpClient);

  /** GET /tasks */
  getTasks(request?: {
    statuses?: string[];
    status?: string[];
    tags?: string[];
    year?: number | string;
    month?: number | string;
  }): Observable<HandlersTaskDTO[]> {
    let params = new HttpParams();
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
    return this.http.get<HandlersTaskDTO[]>(apiUrl('api/tasks'), { params });
  }

  /** POST /tasks */
  createTask(body: HandlersCreateLogseqTaskRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/tasks'), body);
  }
}
