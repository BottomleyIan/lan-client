// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { JournalEntryWithPriority } from '../../core/api/journal-entry-priority';

export type DayViewTableData = {
  rows: Array<Record<string, string>>;
  columnsSet: Set<string>;
};

export function entriesToDayViewTables(entries: JournalEntryWithPriority[]): DayViewTableData {
  const rows: Array<Record<string, string>> = [];
  const columnsSet = new Set<string>();
  for (const entry of entries) {
    const row = entryToRow(entry);
    if (!row) {
      continue;
    }
    rows.push(row);
    Object.keys(row).forEach((key) => columnsSet.add(key));
  }
  return {
    rows,
    columnsSet,
  };
}

function entryToRow(entry: JournalEntryWithPriority): Record<string, string> | null {
  const resp: Record<string, string> = {};
  const separateLines = entry.body?.match(/[^\r\n]+/g);
  if (separateLines?.length) {
    for (const line of separateLines) {
      const parts = line.split('::');
      if (parts.length < 2) {
        continue;
      }
      const key = parts[0]?.trim();
      const value = parts
        .slice(1)
        .join('::')
        .trim()
        .replaceAll(']] [[', ']]<br />[[')
        .replaceAll(']][[', ']]<br />[[');
      if (key) {
        resp[key] = value;
      }
    }
  }
  return Object.keys(resp).length > 1 ? resp : null;
}
