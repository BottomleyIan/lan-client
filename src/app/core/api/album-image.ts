import { apiUrl } from './api-url';

export function albumImageUrl(albumId: string | number): string {
  return apiUrl(`api/albums/${albumId}/image`);
}
