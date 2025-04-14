import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEspecialidadesComponent } from './view-especialidades.component';

describe('ViewEspecialidadesComponent', () => {
  let component: ViewEspecialidadesComponent;
  let fixture: ComponentFixture<ViewEspecialidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEspecialidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewEspecialidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
