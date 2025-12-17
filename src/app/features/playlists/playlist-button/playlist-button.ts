import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';

export type PlaylistButtonModel = {
  id: string;
  name: string;
};

@Component({
  selector: 'app-playlist-button',
  imports: [CommonModule, BigButtonDirective],
  templateUrl: './playlist-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistButton {
  @Input({ required: true }) playlist!: PlaylistButtonModel;
  @Input({ required: true }) selected!: boolean;
}
