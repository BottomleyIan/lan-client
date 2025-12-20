import { ChangeDetectionStrategy, Component, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Panel } from '../../../ui/panel/panel';
import { LetterSelector, type LetterOption } from '../../../ui/letter-selector/letter-selector';
import { AlbumsList } from '../albums-list/albums-list';
import { AlbumDetail } from '../album-detail/album-detail';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';

@Component({
  selector: 'app-albums-page',
  imports: [CommonModule, Panel, LetterSelector, AlbumsList, AlbumDetail, IconButtonPrimary],
  templateUrl: './albums-page.html',
  styleUrl: './albums-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsPage {
  protected readonly selectedAlbumId = signal<string | null>(null);
  protected readonly letter1 = signal<LetterOption>('*');
  protected readonly letter2 = signal<LetterOption>('*');

  @ViewChild('letter1Ref') private letter1Selector?: LetterSelector;
  @ViewChild('letter2Ref') private letter2Selector?: LetterSelector;
  @ViewChild(AlbumsList) private albumsList?: AlbumsList;

  protected readonly selectedLetters = computed(() => this.combineLetters());

  protected focusLetter1 = (): void => {
    this.letter1Selector?.focus();
  };

  protected focusLetter2 = (): void => {
    this.letter2Selector?.focus();
  };

  protected focusAlbumList = (): void => {
    this.albumsList?.focus();
  };

  protected handleAlbumSelected = (albumId: string): void => {
    this.selectedAlbumId.set(albumId);
  };

  protected updateLetter1 = (value: LetterOption): void => {
    this.letter1.set(value);
  };

  protected updateLetter2 = (value: LetterOption): void => {
    this.letter2.set(value);
  };

  private combineLetters(): string {
    const letters = [this.letter1(), this.letter2()].filter(
      (value): value is LetterOption => !!value && value !== '*',
    );
    return letters.join('').toLowerCase();
  }
}
