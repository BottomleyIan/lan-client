import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { finalize } from 'rxjs';
import { BigButtonDirective } from '../../../ui/directives/big-button';

import { type PlayerServiceTrack } from '../../../core/services/player-service';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerFacade } from '../../../core/services/player-facade';
import { AppDialog } from '../../../ui/dialog/dialog';
import { H2Directive } from '../../../ui/directives/h2';
import { Icon } from '../../../ui/icon/icon';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { formatDurationMs } from '../../../shared/utils/time';

@Component({
  selector: 'app-track-button',
  imports: [AppDialog, BigButtonDirective, H2Directive, Icon, IconButtonPrimary, IconButtonDanger],
  templateUrl: './track-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackButton {
  readonly track = input.required<PlayerServiceTrack>();
  readonly player = inject(PlayerFacade);
  private readonly dialog = viewChild.required<AppDialog>('dialog');

  protected readonly formattedDuration = computed(() => {
    const durationMs = this.track().durationMs ?? 0;
    return durationMs > 0 ? formatDurationMs(durationMs) : null;
  });
  protected readonly dialogTitleId = computed(() => `track-dialog-title-${this.track().id}`);
  protected readonly dialogDescriptionId = computed(
    () => `track-dialog-description-${this.track().id}`,
  );
  protected readonly isWorking = signal(false);

  protected openDialog(): void {
    this.dialog().open();
  }

  protected closeDialog(): void {
    this.dialog().close();
  }

  protected playTrack(): void {
    if (this.isWorking()) return;
    const track = this.track();
    this.isWorking.set(true);
    this.player
      .enqueueAndPlay$(track.id)
      .pipe(finalize(() => this.isWorking.set(false)))
      .subscribe({
        next: () => this.closeDialog(),
      });
  }

  protected addToPlaylist(): void {
    if (this.isWorking()) return;
    const track = this.track();
    this.isWorking.set(true);
    this.player
      .enqueueToEnd$(track.id)
      .pipe(finalize(() => this.isWorking.set(false)))
      .subscribe({
        next: () => this.closeDialog(),
      });
  }
}
