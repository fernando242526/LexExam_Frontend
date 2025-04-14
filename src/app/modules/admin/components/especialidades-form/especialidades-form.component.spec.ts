import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspecialidadesFormComponent } from './especialidades-form.component';

describe('EspecialidadesFormComponent', () => {
  let component: EspecialidadesFormComponent;
  let fixture: ComponentFixture<EspecialidadesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspecialidadesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EspecialidadesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
