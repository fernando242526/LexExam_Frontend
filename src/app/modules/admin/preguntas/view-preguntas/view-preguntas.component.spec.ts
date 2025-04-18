import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPreguntasComponent } from './view-preguntas.component';

describe('ViewPreguntasComponent', () => {
  let component: ViewPreguntasComponent;
  let fixture: ComponentFixture<ViewPreguntasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPreguntasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPreguntasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
