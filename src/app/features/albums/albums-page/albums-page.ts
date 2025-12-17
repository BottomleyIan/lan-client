import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ParamMap } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { LetterSelector } from '../../../ui/letter-selector/letter-selector';
import { AlbumsList } from '../albums-list/albums-list';

@Component({
  selector: 'app-albums-page',
  imports: [CommonModule, Panel, LetterSelector, AlbumsList],
  templateUrl: './albums-page.html',
  styleUrl: './albums-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  protected readonly selectedAlbumId = signal<string | null>(null);

  @ViewChild('letter1Ref') private letter1Selector?: LetterSelector;
  @ViewChild('letter2Ref') private letter2Selector?: LetterSelector;

  protected readonly selectedLetters = computed(
    () => this.startsWithValue(this.queryParams()) ?? '',
  );

  protected focusLetter1 = (): void => {
    this.letter1Selector?.focus();
  };

  protected focusLetter2 = (): void => {
    this.letter2Selector?.focus();
  };

  protected handleAlbumSelected = (albumId: string): void => {
    this.selectedAlbumId.set(albumId);
  };

  private startsWithValue(params: ParamMap): string | null {
    const letters = [params.get('letter1'), params.get('letter2')].filter(
      (value): value is string => !!value && value !== '*',
    );
    if (letters.length === 0) {
      return null;
    }
    return letters.join('').toLowerCase();
  }
}
