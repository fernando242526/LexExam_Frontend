import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponentComponent } from './pagination.component';

describe('PaginationComponentComponent', () => {
  let component: PaginationComponentComponent;
  let fixture: ComponentFixture<PaginationComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaginationComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
