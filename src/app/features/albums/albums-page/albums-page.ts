import { ChangeDetectionStrategy, Component, ViewChild, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Panel, PanelAction } from '../../../ui/panel/panel';
import { LetterSelector, type LetterOption } from '../../../ui/letter-selector/letter-selector';
import { AlbumsList } from '../albums-list/albums-list';
import { AlbumDetail } from '../album-detail/album-detail';
import { ArtistsList } from '../../artists/artists-list/artists-list';

type FilterEntity = 'ALBUM' | 'ARTIST';
@Component({
  selector: 'app-albums-page',
  imports: [CommonModule, Panel, LetterSelector, AlbumsList, AlbumDetail, ArtistsList],
  templateUrl: './albums-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumsPage {
  protected readonly selectedAlbumId = signal<string | null>(null);
  protected readonly selectedArtistId = signal<string | null>(null);
  protected readonly filterEntity = signal<FilterEntity>('ARTIST');
  protected readonly letter1 = signal<LetterOption>('*');
  protected readonly letter2 = signal<LetterOption>('*');

  @ViewChild('letter1Ref') private letter1Selector?: LetterSelector;
  @ViewChild('letter2Ref') private letter2Selector?: LetterSelector;
  @ViewChild(AlbumsList) private albumsList?: AlbumsList;
  @ViewChild(AlbumDetail) private albumDetail?: AlbumDetail;

  protected readonly selectedLetters = computed(() => this.combineLetters());

  protected setFilterEntity(entity: FilterEntity): void {
    this.filterEntity.set(entity);
  }
  protected showArtistList(): boolean {
    return this.filterEntity() === 'ARTIST';
  }
  protected showAlbumList(): boolean {
    return this.filterEntity() === 'ALBUM';
  }

  protected focusLetter1 = (): void => {
    this.letter1Selector?.focus();
  };

  protected focusLetter2 = (): void => {
    this.letter2Selector?.focus();
  };

  protected focusAlbumList = (): void => {
    this.albumsList?.selectFirstAlbum();
  };

  protected focusAlbumListFromTracks = (): void => {
    this.albumsList?.focus();
  };

  protected focusLetter2FromAlbums = (): void => {
    this.selectedAlbumId.set(null);
    this.letter2Selector?.focus();
  };

  protected focusLetter1FromLetter2 = (): void => {
    this.letter2.set('*');
    this.letter1Selector?.focus();
  };

  protected focusTracksList = (): void => {
    this.albumDetail?.focusTracks();
  };

  protected handleAlbumSelected = (albumId: string): void => {
    this.selectedAlbumId.set(albumId);
    this.selectedArtistId.set(null);
  };

  protected handleArtistSelected = (artistId: string): void => {
    this.selectedAlbumId.set(null);
    this.selectedArtistId.set(artistId);
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

  getPanelActions(): PanelAction[] {
    return [
      {
        icon: 'album',
        label: 'Album',
        disabled: false,
        onPress: () => this.setFilterEntity('ALBUM'),
        //buttonClass?: string | null;
        //iconClass?: string | null;
        active: this.filterEntity() === 'ALBUM',
        activeClass: 'text-tokyo-accent-orange',
      },
      {
        icon: 'artist',
        label: 'Artist',
        disabled: false,
        onPress: () => this.setFilterEntity('ARTIST'),
        //buttonClass?: string | null;
        //iconClass?: string | null;
        active: this.filterEntity() === 'ARTIST',
        activeClass: 'text-tokyo-accent-orange',
      },
    ];
  }
}
