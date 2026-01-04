import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'calendar/:year/:month/:day',
    loadComponent: () =>
      import('./features/calendar/calendar-day-page/calendar-day-page').then(
        (c) => c.CalendarDayPage,
      ),
    data: { navTitleMode: 'calendar-day' },
  },
  {
    path: 'calendar/:year/:month',
    loadComponent: () =>
      import('./features/calendar/calendar-page/calendar-page').then((c) => c.CalendarPage),
    data: { navTitleMode: 'calendar-month' },
  },
  { path: '', pathMatch: 'full', redirectTo: 'playlists' },
  {
    path: 'playlists',
    loadComponent: () =>
      import('./features/playlists/playlists-page/playlists-page').then((c) => c.PlaylistsPage),
    data: { navTitle: 'Playlists' },
  },
  {
    path: 'music-filter',
    loadComponent: () =>
      import('./features/music-filter/music-filter-page/music-filter-page').then(
        (c) => c.MusicFilterPage,
      ),
    data: { navTitle: 'Music Filter' },
  },
  {
    path: 'artists',
    loadComponent: () =>
      import('./features/artists/artists-page/artists-page').then((c) => c.ArtistsPage),
  },
  {
    path: 'albums',
    loadComponent: () =>
      import('./features/albums/albums-page/albums-page').then((c) => c.AlbumsPage),
  },
  {
    path: 'albums/:id',
    loadComponent: () =>
      import('./features/albums/album-detail-page/album-detail-page').then(
        (c) => c.AlbumDetailPage,
      ),
  },
  {
    path: 'property-keys',
    loadComponent: () =>
      import('./features/property-keys/property-keys-page/property-keys-page').then(
        (c) => c.PropertyKeysPage,
      ),
    data: { navTitle: 'Property keys' },
  },
  {
    path: 'property-keys/:key',
    loadComponent: () =>
      import('./features/property-keys/property-key-values-page/property-key-values-page').then(
        (c) => c.PropertyKeyValuesPage,
      ),
    data: { navTitle: 'Property keys', navSubtitleParam: 'key' },
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/journal-entries/kanban/kanban').then((c) => c.JournalEntriesKanban),
    data: { navTitle: 'Tasks' },
  },
  {
    path: 'notes/new',
    loadComponent: () =>
      import('./features/notes/notes-new-page/notes-new-page').then((c) => c.NotesNewPage),
    data: { navTitle: 'New note' },
  },
  {
    path: 'notes/:tag',
    loadComponent: () => import('./features/notes/notes-page/notes-page').then((c) => c.NotesPage),
    data: { navTitle: 'Notes', navSubtitleParam: 'tag' },
  },
  {
    path: 'notes',
    loadComponent: () => import('./features/notes/notes-page/notes-page').then((c) => c.NotesPage),
    data: { navTitle: 'Notes' },
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
