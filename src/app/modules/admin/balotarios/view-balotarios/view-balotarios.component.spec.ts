import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBalotariosComponent } from './view-balotarios.component';

describe('ViewBalotariosComponent', () => {
  let component: ViewBalotariosComponent;
  let fixture: ComponentFixture<ViewBalotariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBalotariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBalotariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
