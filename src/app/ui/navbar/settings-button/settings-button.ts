import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JournalsApi } from '../../../core/api/journals.api';
import {
  NavDropdownMenu,
  type NavDropdownMenuNavItems,
} from '../nav-dropdown-menu/nav-dropdown-menu';

@Component({
  selector: 'app-settings-button',
  imports: [NavDropdownMenu],
  template: `
    <app-nav-dropdown-menu
      icon="settings"
      uid="nav-settings"
      label="settings"
      [navItems]="navItems()"
      (actionTriggered)="handleAction($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSettingsButton {
  private readonly journalsApi = inject(JournalsApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSyncing = signal(false);
  protected readonly navItems = computed<NavDropdownMenuNavItems[]>(() => [
    { name: 'Settings', url: 'settings' },
    { name: 'Sync journals', actionId: 'sync', disabled: this.isSyncing() },
  ]);

  protected handleAction(actionId: string): void {
    if (actionId === 'sync') {
      this.sync();
    }
  }

  private sync(): void {
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
