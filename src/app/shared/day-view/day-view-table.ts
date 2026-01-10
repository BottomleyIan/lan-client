import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MarkdownBody } from '../markdown/markdown-body';
import { TableDirective } from '../../ui/directives/table';
import { TableHeadDirective } from '../../ui/directives/thead';

type DayViewTableData = {
  rows: Array<Record<string, string>>;
  columnsSet: Set<string>;
};

@Component({
  selector: 'app-day-view-table',
  imports: [CommonModule, TableDirective, TableHeadDirective, MarkdownBody],
  templateUrl: './day-view-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayViewTable {
  readonly table = input.required<DayViewTableData>();

  protected readonly columns = computed(() => Array.from(this.table().columnsSet));
}
