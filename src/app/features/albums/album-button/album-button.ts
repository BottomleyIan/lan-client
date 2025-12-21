import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';
import { H2Directive } from '../../../ui/directives/h2';

export type AlbumButtonModel = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
};

@Component({
  selector: 'app-album-button',
  imports: [BigButtonDirective, CommonModule, H2Directive],
  templateUrl: './album-button.html',
})
export class AlbumButton {
  @Input({ required: true }) album!: AlbumButtonModel;
  @Input({ required: true }) selected!: boolean;

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }
}
