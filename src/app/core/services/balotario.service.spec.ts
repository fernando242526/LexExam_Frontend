import { TestBed } from '@angular/core/testing';

import { BalotarioService } from './balotario.service';

describe('BalotarioService', () => {
  let service: BalotarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BalotarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
