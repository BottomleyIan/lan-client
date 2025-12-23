import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TasksApi } from '../../../core/api/tasks.api';
import type { HandlersTaskDTO } from '../../../core/api/generated/api-types';
import { Panel } from '../../../ui/panel/panel';
import { CalendarTask } from '../calendar-task/calendar-task';
import { isAllowedTaskStatus } from '../../../shared/tasks/task-status';

@Component({
  selector: 'app-calendar-day-page',
  imports: [CommonModule, RouterLink, Panel, CalendarTask],
  templateUrl: './calendar-day-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayPage {
  private readonly route = inject(ActivatedRoute);
  private readonly tasksApi = inject(TasksApi);
  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly tasks = toSignal(this.tasksApi.getTasks(), { initialValue: [] });

  protected readonly year = computed(() => toNumber(this.params().get('year')));
  protected readonly month = computed(() => toNumber(this.params().get('month')));
  protected readonly day = computed(() => toNumber(this.params().get('day')));

  protected readonly tasksForDay = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return [];
    }

    return this.tasks().filter((task) => {
      if (!isAllowedTaskStatus(task.status)) {
        return false;
      }
      const date = resolveTaskDate(task);
      return !!date && date.year === year && date.month === month && date.day === day;
    });
  });

  protected readonly title = computed(() => {
    const year = this.year();
    const month = this.month();
    const day = this.day();
    if (!year || !month || !day) {
      return 'Calendar';
    }
    return `${MONTH_NAMES[month - 1] ?? 'Month'} ${day}, ${year}`;
  });
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

function toNumber(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

type DateParts = { year: number; month: number; day: number };

function resolveTaskDate(task: HandlersTaskDTO): DateParts | null {
  return (
    parseDateParts(task.deadline_at) ??
    parseDateParts(task.scheduled_at) ??
    parseDatePartsFromFields(task)
  );
}

function parseDateParts(raw?: string): DateParts | null {
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

function parseDatePartsFromFields(task: HandlersTaskDTO): DateParts | null {
  if (!task.year || !task.month || !task.day) {
    return null;
  }
  return { year: task.year, month: task.month, day: task.day };
}
