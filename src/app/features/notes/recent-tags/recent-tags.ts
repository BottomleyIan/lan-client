import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { JournalsApi } from '../../../core/api/journals.api';

@Component({
  selector: 'app-recent-tags',
  imports: [CommonModule, AsyncPipe],
  templateUrl: './recent-tags.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTags {
  private readonly journalsApi = inject(JournalsApi);

  protected readonly recentTags$ = this.journalsApi.listRecentTags();

  protected tagHref(tag: string): string {
    return `/notes?tag=${encodeURIComponent(tag)}`;
  }
}
