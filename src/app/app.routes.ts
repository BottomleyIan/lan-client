import type { Routes } from '@angular/router';
import { PlaylistsPage } from './features/playlists/playlists-page/playlists-page';
import { ArtistsPage } from './features/artists/artists-page/artists-page';
import { AlbumsPage } from './features/albums/albums-page/albums-page';
import { AlbumDetailPage } from './features/albums/album-detail-page/album-detail-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'playlists' },
  { path: 'playlists', component: PlaylistsPage },
  { path: 'artists', component: ArtistsPage },
  { path: 'albums', component: AlbumsPage },
  { path: 'albums/:id', component: AlbumDetailPage },
  { path: '**', redirectTo: 'playlists' },
];
