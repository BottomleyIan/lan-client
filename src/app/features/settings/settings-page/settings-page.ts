import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Panel } from '../../../ui/panel/panel';

@Component({
  selector: 'app-settings-page',
  imports: [Panel],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {}
