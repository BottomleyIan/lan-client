import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  HandlersCreateSettingRequest,
  HandlersSettingDTO,
  HandlersSettingKeyDTO,
  HandlersUpdateSettingRequest,
} from './generated/api-types';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(HttpClient);

  /** GET /settings */
  getSettings(): Observable<HandlersSettingDTO[]> {
    return this.http.get<HandlersSettingDTO[]>(apiUrl('api/settings'));
  }

  /** GET /settings/keys */
  getSettingKeys(): Observable<HandlersSettingKeyDTO[]> {
    return this.http.get<HandlersSettingKeyDTO[]>(apiUrl('api/settings/keys'));
  }

  /** GET /settings/:key */
  getSetting(key: string): Observable<HandlersSettingDTO> {
    return this.http.get<HandlersSettingDTO>(apiUrl(`api/settings/${key}`));
  }

  /** POST /settings */
  createSetting(body: HandlersCreateSettingRequest): Observable<HandlersSettingDTO> {
    return this.http.post<HandlersSettingDTO>(apiUrl('api/settings'), body);
  }

  /** PUT /settings/:key */
  updateSetting(key: string, body: HandlersUpdateSettingRequest): Observable<HandlersSettingDTO> {
    return this.http.put<HandlersSettingDTO>(apiUrl(`api/settings/${key}`), body);
  }

  /** DELETE /settings/:key */
  deleteSetting(key: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`api/settings/${key}`));
  }
}
