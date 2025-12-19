import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateTaskRequest,
  HandlersCreateTaskTransitionRequest,
  HandlersTaskDTO,
  HandlersTaskStatusDTO,
  HandlersTaskTransitionDTO,
  HandlersUpdateTaskRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  private readonly http = inject(HttpClient);

  /** GET /tasks */
  getTasks(): Observable<HandlersTaskDTO[]> {
    return this.http.get<HandlersTaskDTO[]>(apiUrl('api/tasks'));
  }

  /** GET /tasks/:id */
  getTask(id: number | string): Observable<HandlersTaskDTO> {
    return this.http.get<HandlersTaskDTO>(apiUrl(`api/tasks/${id}`));
  }

  /** POST /tasks */
  createTask(body: HandlersCreateTaskRequest): Observable<HandlersTaskDTO> {
    return this.http.post<HandlersTaskDTO>(apiUrl('api/tasks'), body);
  }

  /** PUT /tasks/:id */
  updateTask(id: number | string, body: HandlersUpdateTaskRequest): Observable<HandlersTaskDTO> {
    return this.http.put<HandlersTaskDTO>(apiUrl(`api/tasks/${id}`), body);
  }

  /** DELETE /tasks/:id */
  deleteTask(id: number | string): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/tasks/${id}`));
  }

  /** GET /tasks/statuses */
  getTaskStatuses(): Observable<HandlersTaskStatusDTO[]> {
    return this.http.get<HandlersTaskStatusDTO[]>(apiUrl('api/tasks/statuses'));
  }

  /** GET /tasks/:id/transitions */
  getTaskTransitions(id: number | string): Observable<HandlersTaskTransitionDTO[]> {
    return this.http.get<HandlersTaskTransitionDTO[]>(apiUrl(`api/tasks/${id}/transitions`));
  }

  /** POST /tasks/:id/transitions */
  createTaskTransition(
    id: number | string,
    body: HandlersCreateTaskTransitionRequest,
  ): Observable<HandlersTaskTransitionDTO> {
    return this.http.post<HandlersTaskTransitionDTO>(
      apiUrl(`api/tasks/${id}/transitions`),
      body,
    );
  }
}
