import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon, type IconName } from '../icon/icon';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './nav-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLink {
  readonly label = input<string>('Link');
  readonly routerLink = input<string | unknown[]>('/');
  readonly exact = input(false);
  readonly iconName = input<IconName | null>(null);
  readonly iconColorVar = input<string | null>(null);
  readonly srOnly = input(false);
  readonly showSkipLink = input(false);

  protected readonly routerLinkActiveOptions = computed(() => ({ exact: this.exact() }));
  protected readonly skipLinkDismissed = signal(false);

  protected resetSkipLink(): void {
    this.skipLinkDismissed.set(false);
  }

  protected dismissSkipLink(): void {
    this.skipLinkDismissed.set(true);
  }
}
