import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconButtonPrimary } from '../../ui/icon-button/icon-button-primary';
import type { IconName } from '../../ui/icon/icon';

@Component({
  selector: 'app-star-rating',
  imports: [IconButtonPrimary],
  templateUrl: './star-rating.html',
  host: {
    class: 'flex text-2xl',
    role: 'group',
    '[attr.aria-label]': 'label()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRating {
  readonly rating = input<number>(0);
  readonly label = input<string>('Track rating');
  readonly onChange = input<(rating: number) => void>(() => {});

  protected readonly stars = [1, 2, 3, 4, 5];

  protected iconFor(star: number): IconName {
    return star <= this.rating() ? 'star' : 'starOutline';
  }

  protected labelFor(star: number): string {
    return `${star} Star${star === 1 ? '' : 's'}`;
  }

  protected buttonClassFor(star: number): string {
    if (star <= this.rating()) {
      return 'text-tokyo-accent-yellow tokyo-glow-cyan-hover hover:text-tokyo-accent-cyan';
    }
    return 'text-tokyo-accent-cyan hover:text-tokyo-accent-orange tokyo-glow-orange-hover';
  }

  protected setRating(star: number): void {
    this.onChange()(star);
  }
}
