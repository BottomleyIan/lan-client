import { Injectable, inject } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { HandlersCalendarImageDTO, HandlersDayViewDTO } from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class CalendarApi {
  private readonly http = inject(HttpClient);

  /** GET /calendar */
  getDayView(
    year: number | string,
    month: number | string,
    day: number | string,
  ): Observable<HandlersDayViewDTO> {
    const params = new HttpParams()
      .set('year', String(year))
      .set('month', String(month))
      .set('day', String(day));
    return this.http.get<HandlersDayViewDTO>(apiUrl('api/calendar'), { params });
  }

  /** GET /calendar/images/:year/:month */
  listCalendarImages(
    year: number | string,
    month: number | string,
  ): Observable<HandlersCalendarImageDTO[]> {
    return this.http.get<HandlersCalendarImageDTO[]>(
      apiUrl(`api/calendar/images/${year}/${month}`),
    );
  }
}
