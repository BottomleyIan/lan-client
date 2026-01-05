import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconButtonPrimary } from '../../icon-button/icon-button-primary';
import { TitleCasePipe } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { IconName } from '../../icon/icons';

export interface NavDropdownMenuNavItems {
  name: string;
  url: string;
}

@Component({
  selector: 'app-nav-dropdown-menu',
  imports: [IconButtonPrimary, TitleCasePipe],
  templateUrl: './nav-dropdown-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './nav-dropdown-menu.css',
})
export class NavDropdownMenu {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly uid = input.required<string>();
  readonly navItems = input.required<Array<NavDropdownMenuNavItems>>();

  protected buttonId(): string {
    return `${this.uid}-anchor`;
  }
  protected popoverId(): string {
    return `${this.uid}-popover`;
  }
  protected anchorName(): string {
    return `--${this.uid}-anchor`;
  }
  protected top(): string {
    return 'anchor(bottom)';
  }
  protected right(): string {
    return 'anchor(right)';
  }
  protected left(): string {
    return 'auto';
  }
}
