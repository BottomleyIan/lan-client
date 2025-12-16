import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      class="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm font-semibold tracking-wide text-slate-100 no-underline transition duration-150 ease-out hover:-translate-y-px hover:border-cyan-300/40 hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-pink-500/10 hover:text-white hover:shadow-lg hover:shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300/70"
      [routerLink]="routerLink()"
      routerLinkActive="bg-gradient-to-r from-cyan-400/80 to-pink-500/80 text-slate-900 border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_12px_38px_rgba(34,211,238,0.2)]"
      #rla="routerLinkActive"
      [routerLinkActiveOptions]="routerLinkActiveOptions()"
      [attr.aria-current]="rla.isActive ? 'page' : null"
    >
      {{ label() }}
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLink {
  readonly label = input<string>('Link');
  readonly routerLink = input<string | unknown[]>('/');
  readonly exact = input(false);

  protected readonly routerLinkActiveOptions = computed(() => ({ exact: this.exact() }));
}
