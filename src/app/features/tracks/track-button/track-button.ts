import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';

import { type PlayerServiceTrack } from '../../../core/services/player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from '../../../core/services/player-facade';

@Component({
  selector: 'app-track-button',
  imports: [BigButtonDirective, CommonModule],
  templateUrl: './track-button.html',
})
export class TrackButton {
  @Input({ required: true }) track!: PlayerServiceTrack;
  constructor(public player: PlayerFacade) {}

  enqueue(): void {
    this.player.enqueueAndPlay$(this.track.id).subscribe({
      next: (res) => console.log('added', res),
      error: (err) => console.error(err),
    });
  }
}
