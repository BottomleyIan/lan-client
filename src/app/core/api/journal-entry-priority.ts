import type { HandlersJournalEntryDTO } from './generated/api-types';

export type TaskPriority = 'low' | 'medium' | 'high';
export type EntryPriority = TaskPriority | null;
export type JournalEntryWithPriority = HandlersJournalEntryDTO & {
  priority: EntryPriority;
};

const HIGH_PRIORITY_TOKEN = 'priority:: high';
const LOW_PRIORITY_TOKEN = 'priority:: low';

export function resolveEntryPriority(entry: HandlersJournalEntryDTO): EntryPriority {
  const entryType = entry.type?.trim().toLowerCase();
  if (entryType === 'note') {
    return null;
  }
  const body = entry.body?.toLowerCase() ?? '';
  if (body.includes(HIGH_PRIORITY_TOKEN)) {
    return 'high';
  }
  if (body.includes(LOW_PRIORITY_TOKEN)) {
    return 'low';
  }
  return 'medium';
}

export function withEntryPriority(entry: HandlersJournalEntryDTO): JournalEntryWithPriority {
  return { ...entry, priority: resolveEntryPriority(entry) };
}
