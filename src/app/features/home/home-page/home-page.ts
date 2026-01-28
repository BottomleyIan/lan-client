import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule],
  template: `<div class="min-h-[40vh]"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
