import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {}
