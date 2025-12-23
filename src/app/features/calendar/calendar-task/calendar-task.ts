import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { HandlersTaskDTO } from '../../../core/api/generated/api-types';

@Component({
  selector: 'app-calendar-task',
  imports: [CommonModule],
  templateUrl: './calendar-task.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarTask {
  readonly task = input.required<HandlersTaskDTO>();
}
