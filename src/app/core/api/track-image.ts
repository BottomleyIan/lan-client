import { apiUrl } from './api-url';

export function trackImageUrl(trackId: string | number): string {
  return apiUrl(`api/tracks/${trackId}/image`);
}
