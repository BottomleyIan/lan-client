import type { Routes } from '@angular/router';
import { PlaylistsPage } from './features/playlists/playlists-page/playlists-page';
import { ArtistsPage } from './features/artists/artists-page/artists-page';
import { AlbumsPage } from './features/albums/albums-page/albums-page';
import { AlbumDetailPage } from './features/albums/album-detail-page/album-detail-page';
import { CalendarPage } from './features/calendar/calendar-page/calendar-page';
import { CalendarDayPage } from './features/calendar/calendar-day-page/calendar-day-page';
import { MusicFilterPage } from './features/music-filter/music-filter-page/music-filter-page';

export const routes: Routes = [
  { path: 'calendar/:year/:month/:day', component: CalendarDayPage },
  { path: 'calendar/:year/:month', component: CalendarPage },
  { path: '', pathMatch: 'full', redirectTo: 'playlists' },
  { path: 'playlists', component: PlaylistsPage },
  { path: 'music-filter', component: MusicFilterPage },
  { path: 'artists', component: ArtistsPage },
  { path: 'albums', component: AlbumsPage },
  { path: 'albums/:id', component: AlbumDetailPage },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/journal-entries/journal-entries-page/journal-entries-page').then(
        (c) => c.JournalEntriesPage,
      ),
  },
  {
    path: 'notes',
    loadComponent: () => import('./features/notes/notes-page/notes-page').then((c) => c.NotesPage),
  },
  {
    path: 'notes/:tag',
    loadComponent: () => import('./features/notes/notes-page/notes-page').then((c) => c.NotesPage),
  },
  {
    path: 'files',
    loadComponent: () => import('./features/files/files-page/files-page').then((c) => c.FilesPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-page/settings-page').then((c) => c.SettingsPage),
  },
  { path: '**', redirectTo: 'playlists' },
];
