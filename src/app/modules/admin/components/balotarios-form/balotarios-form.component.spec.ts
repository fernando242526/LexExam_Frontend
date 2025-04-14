import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalotariosFormComponent } from './balotarios-form.component';

describe('BalotariosFormComponent', () => {
  let component: BalotariosFormComponent;
  let fixture: ComponentFixture<BalotariosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalotariosFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalotariosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
