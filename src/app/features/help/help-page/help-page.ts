import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControlPaletteCommandsService } from '../../../ui/control-palette/control-palette-commands';

@Component({
  selector: 'app-help-page',
  templateUrl: './help-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  private readonly commandsService = inject(ControlPaletteCommandsService);
  protected readonly commands = this.commandsService.getHelpCommands();
}
