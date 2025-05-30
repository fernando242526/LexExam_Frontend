import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemasFormComponent } from './temas-form.component';

describe('TemasFormComponent', () => {
  let component: TemasFormComponent;
  let fixture: ComponentFixture<TemasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
