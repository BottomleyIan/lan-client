import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NavLink } from '../nav-link/nav-link';
import { JournalEntryAddButton } from './journal-entry-add-button/journal-entry-add-button';
import { CalendarMonthTitle } from '../../features/calendar/calendar-month-title/calendar-month-title';
import { CalendarDayTitle } from '../../features/calendar/calendar-day-title/calendar-day-title';
import { AppTasksButton } from './tasks-button/tasks-button';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [NavLink, JournalEntryAddButton, CalendarMonthTitle, CalendarDayTitle, AppTasksButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly title = input<string>('LAN Music');
  readonly subtitle = input<string>('client');
  readonly titleMode = input<'default' | 'calendar-month' | 'calendar-day'>('default');
  protected readonly currentYear = signal(new Date().getFullYear());
  protected readonly currentMonth = signal(new Date().getMonth() + 1);
}
