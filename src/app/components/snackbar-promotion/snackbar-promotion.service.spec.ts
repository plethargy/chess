import { TestBed } from '@angular/core/testing';

import { SnackbarPromotionService } from './snackbar-promotion.service';

describe('SnackbarPromotionService', () => {
  let service: SnackbarPromotionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarPromotionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
