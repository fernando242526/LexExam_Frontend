import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpezarExamenComponent } from './empezar-examen.component';

describe('EmpezarExamenComponent', () => {
  let component: EmpezarExamenComponent;
  let fixture: ComponentFixture<EmpezarExamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpezarExamenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpezarExamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
