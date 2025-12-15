import type { Routes } from '@angular/router';
import { PlaylistsPage } from './features/playlists/playlists-page/playlists-page';
import { ArtistsPage } from './features/artists/artists-page/artists-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'playlists' },
  { path: 'playlists', component: PlaylistsPage },
  { path: 'artists', component: ArtistsPage },
  { path: '**', redirectTo: 'playlists' },
];
