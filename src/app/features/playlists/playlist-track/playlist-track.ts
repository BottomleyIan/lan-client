import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButton } from '../../../ui/icon-button/icon-button';
import { TrackOverview } from '../../tracks/track-overview/track-overview';
import { PlaylistService } from '../../../core/services/playlist-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerService } from '../../../core/services/player-service';

export type PlaylistTrackVm = {
  id: string;
  trackId: number | null;
  title: string;
  artist?: string;
  year?: string;
  imageUrl?: string;
  rating?: number;
  durationMs?: number;
};

@Component({
  selector: 'app-playlist-track',
  imports: [CommonModule, IconButton, TrackOverview],
  templateUrl: './playlist-track.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistTrack {
  private readonly playerService = inject(PlayerService);
  private readonly activeTrack = toSignal(this.playerService.currentTrack$, {
    initialValue: null,
  });

  readonly track = input.required<PlaylistTrackVm>();
  readonly removable = input(false);
  readonly remove = output<void>();

  handleRemove(): void {
    if (!this.removable()) {
      return;
    }
    this.remove.emit();
  }
  isSelected(): boolean {
    const activeTrack = this.activeTrack();
    if (activeTrack === null) {
      return false;
    }
    return activeTrack.id === this.track().id;
  }
}
