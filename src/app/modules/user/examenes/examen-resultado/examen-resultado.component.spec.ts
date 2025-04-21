import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamenResultadoComponent } from './examen-resultado.component';

describe('ExamenResultadoComponent', () => {
  let component: ExamenResultadoComponent;
  let fixture: ComponentFixture<ExamenResultadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamenResultadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamenResultadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
