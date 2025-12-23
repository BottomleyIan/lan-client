import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';
import { H2Directive } from '../../../ui/directives/h2';

export type ArtistButtonModel = {
  id: string;
  name: string;
  //artist: string;
  //year?: number;
  //coverUrl?: string;
};

@Component({
  selector: 'app-artist-button',
  imports: [BigButtonDirective, CommonModule, H2Directive],
  templateUrl: './artist-button.html',
})
export class ArtistButton {
  @Input({ required: true }) artist!: ArtistButtonModel;
  @Input({ required: true }) selected!: boolean;

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }
}
