import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ArtistsPage } from './artists-page';

describe('ArtistsPage', () => {
  let component: ArtistsPage;
  let fixture: ComponentFixture<ArtistsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtistsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
