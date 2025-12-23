import type { HandlersTaskDTO } from '../../core/api/generated/api-types';
import type { IconName } from '../../ui/icon/icon';

const UPCOMING_WINDOW_DAYS = 7;

export const TASK_STATUS_CONFIG = {
  TODO: { icon: 'taskTodo', colorClass: 'text-tokyo-text' },
  DONE: { icon: 'taskDone', colorClass: 'text-tokyo-accent-green' },
  CANCELLED: { icon: 'taskRemove', colorClass: 'text-tokyo-text-muted' },
  'IN-PROGRESS': { icon: 'taskTodo', colorClass: 'text-tokyo-text' },
} as const satisfies Record<string, { icon: IconName; colorClass: string }>;

export type TaskStatus = keyof typeof TASK_STATUS_CONFIG;

export const TASK_STATUS_KEYS = Object.keys(TASK_STATUS_CONFIG) as TaskStatus[];

export function isAllowedTaskStatus(status?: string): status is TaskStatus {
  return status ? status in TASK_STATUS_CONFIG : false;
}

export function getTaskStatusConfig(
  status?: string,
): { icon: IconName; colorClass: string } | null {
  return status && status in TASK_STATUS_CONFIG ? TASK_STATUS_CONFIG[status as TaskStatus] : null;
}

export function getTaskAccentClass(task: HandlersTaskDTO): string {
  const status = task.status;
  const config = getTaskStatusConfig(status);
  if (!config) {
    return 'text-tokyo-text';
  }
  if (status === 'DONE' || status === 'CANCELLED') {
    return config.colorClass;
  }

  const dueDate = parseDueDate(task.deadline_at ?? task.scheduled_at);
  if (!dueDate) {
    return config.colorClass;
  }

  const now = new Date();
  if (dueDate.getTime() < now.getTime()) {
    return 'text-rose-400';
  }

  const upcomingCutoff = new Date(now);
  upcomingCutoff.setDate(upcomingCutoff.getDate() + UPCOMING_WINDOW_DAYS);
  if (dueDate.getTime() <= upcomingCutoff.getTime()) {
    return 'text-rose-400/50';
  }

  return config.colorClass;
}

function parseDueDate(raw?: string): Date | null {
  if (!raw) {
    return null;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
