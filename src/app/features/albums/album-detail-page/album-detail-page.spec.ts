import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { AlbumDetailPage } from './album-detail-page';

describe('AlbumDetailPage', () => {
  let component: AlbumDetailPage;
  let fixture: ComponentFixture<AlbumDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
