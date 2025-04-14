import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTemasComponent } from './view-temas.component';

describe('ViewTemasComponent', () => {
  let component: ViewTemasComponent;
  let fixture: ComponentFixture<ViewTemasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTemasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewTemasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
