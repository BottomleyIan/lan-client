import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { PlaylistsPage } from './playlists-page';

describe('PlaylistsPage', () => {
  let component: PlaylistsPage;
  let fixture: ComponentFixture<PlaylistsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
