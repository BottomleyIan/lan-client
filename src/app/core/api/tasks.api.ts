import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersCreateLogseqTaskRequest, HandlersTaskDTO } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  private readonly http = inject(HttpClient);

  /** GET /tasks */
  getTasks(): Observable<HandlersTaskDTO[]> {
    return this.http.get<HandlersTaskDTO[]>(apiUrl('api/tasks'));
  }

  /** POST /tasks */
  createTask(body: HandlersCreateLogseqTaskRequest): Observable<void> {
    return this.http.post<void>(apiUrl('api/tasks'), body);
  }
}
