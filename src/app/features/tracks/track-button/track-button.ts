import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from '../../../core/services/player-service';

import { type PlayerServiceTrack } from '../../../core/services/player-service';

@Component({
  selector: 'app-track-button',
  imports: [BigButtonDirective, CommonModule],
  templateUrl: './track-button.html',
})
export class TrackButton {
  @Input({ required: true }) track!: PlayerServiceTrack;
  constructor(public player: PlayerService) {}
}
