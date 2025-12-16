import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLink {
  readonly label = input<string>('Link');
  readonly routerLink = input<string | unknown[]>('/');
  readonly exact = input(false);

  protected readonly routerLinkActiveOptions = computed(() => ({ exact: this.exact() }));
}
