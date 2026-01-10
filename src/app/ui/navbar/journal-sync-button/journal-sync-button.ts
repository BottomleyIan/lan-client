import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import { IconButtonHighlight } from '../../icon-button/icon-button-highlight';

@Component({
  selector: 'app-journal-sync-button',
  imports: [IconButtonHighlight],
  template: `
    <app-icon-button-highlight
      icon="refresh"
      label="Sync journals"
      [disabled]="isSyncing()"
      [iconClass]="isSyncing() ? 'animate-spin' : null"
      (pressed)="sync()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalSyncButton {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSyncing = signal(false);

  protected sync(): void {
    if (this.isSyncing()) {
      return;
    }
    this.isSyncing.set(true);
    this.journalsApi
      .syncJournals()
      .pipe(
        finalize(() => this.isSyncing.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error) => console.error(error),
      });
  }
}
