import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { JournalsApi } from '../../../core/api/journals.api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recent-tags',
  imports: [CommonModule, AsyncPipe, RouterLink],
  templateUrl: './recent-tags.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTags {
  private readonly journalsApi = inject(JournalsApi);

  protected readonly recentTags$ = this.journalsApi.listRecentTags();
}
