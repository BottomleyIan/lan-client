import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tags',
  imports: [],
  templateUrl: './tags.html',
})
export class Tags {
  readonly tags = input.required<string[]>();
}
