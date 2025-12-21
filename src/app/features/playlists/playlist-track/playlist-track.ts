import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButton } from '../../../ui/icon-button/icon-button';
import { TrackOverview } from '../../tracks/track-overview/track-overview';

export type PlaylistTrackVm = {
  id: string;
  trackId: number | null;
  title: string;
  artist?: string;
  year?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-playlist-track',
  imports: [CommonModule, IconButton, TrackOverview],
  templateUrl: './playlist-track.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistTrack {
  readonly track = input.required<PlaylistTrackVm>();
  readonly removable = input(false);
  readonly remove = output<void>();

  handleRemove(): void {
    if (!this.removable()) {
      return;
    }
    this.remove.emit();
  }
}
