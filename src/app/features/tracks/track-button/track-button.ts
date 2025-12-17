import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BigButtonDirective } from '../../../ui/directives/big-button';

type TrackDetailVm = {
  id: string;
  title: string;
  artist?: string;
  genre?: string;
  year?: string;
  imageUrl?: string;
};

@Component({
  selector: 'app-track-button',
  imports: [BigButtonDirective, CommonModule],
  templateUrl: './track-button.html',
})
export class TrackButton {
  @Input({ required: true }) track!: TrackDetailVm;
}
