import { TestBed } from '@angular/core/testing';

import { PlayerlookupService } from './playerlookup.service';

describe('PlayerlookupService', () => {
  let service: PlayerlookupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerlookupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
