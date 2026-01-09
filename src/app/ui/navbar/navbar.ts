import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NavLink } from '../nav-link/nav-link';
import { JournalEntryAddButton } from './journal-entry-add-button/journal-entry-add-button';
import { CalendarMonthTitle } from '../../features/calendar/calendar-month-title/calendar-month-title';
import { CalendarDayTitle } from '../../features/calendar/calendar-day-title/calendar-day-title';
import { AppTasksButton } from './tasks-button/tasks-button';
import { KanbanFilters } from '../../features/journal-entries/kanban/kanban-filters';
import { NotesTagFilter } from '../../features/notes/notes-tag-filter/notes-tag-filter';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [
    NavLink,
    JournalEntryAddButton,
    CalendarMonthTitle,
    CalendarDayTitle,
    AppTasksButton,
    KanbanFilters,
    NotesTagFilter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly router = inject(Router);

  readonly title = input<string>('LAN Music');
  readonly subtitle = input<string>('client');
  readonly titleMode = input<'default' | 'calendar-month' | 'calendar-day'>('default');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth() + 1);
  protected readonly routeUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly isTasksRoute = computed(() => this.routeUrl().startsWith('/tasks'));
  protected readonly isNotesRoute = computed(() => this.routeUrl().startsWith('/notes'));
}
