import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../ui/directives/big-button';

export type AlbumCardModel = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  coverUrl?: string;
};

@Component({
  selector: 'app-album-card',
  imports: [BigButtonDirective, CommonModule],
  templateUrl: './album-card.html',
  styleUrl: './album-card.css',
})
export class AlbumCard {
  @Input({ required: true }) album!: AlbumCardModel;

  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }
}
