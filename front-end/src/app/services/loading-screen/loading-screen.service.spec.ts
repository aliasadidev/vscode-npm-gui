import { TestBed } from '@angular/core/testing';

import { LoadingScreenService } from './loading-screen.service';

describe('LoadingScreenService', () => {
  let service: LoadingScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
