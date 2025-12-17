import { apiUrl } from './api-url';

export function trackUrl(trackId: string | number): string {
  return apiUrl(`api/tracks/${trackId}/play`);
}
