import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntasFormComponent } from './preguntas-form.component';

describe('PreguntasFormComponent', () => {
  let component: PreguntasFormComponent;
  let fixture: ComponentFixture<PreguntasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreguntasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreguntasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
