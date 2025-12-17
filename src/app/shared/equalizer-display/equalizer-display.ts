import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EqualizerService } from '../../core/services/equalizer.service';

@Component({
  selector: 'app-equalizer-display',
  imports: [CommonModule],
  templateUrl: './equalizer-display.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EqualizerDisplay {
  private readonly equalizer = inject(EqualizerService);

  protected readonly bands = computed(() => this.equalizer.bands());
}
