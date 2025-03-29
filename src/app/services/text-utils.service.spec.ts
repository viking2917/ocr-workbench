import { TestBed } from '@angular/core/testing';

import { TextUtilsService } from './text-utils.service';

describe('TextUtilsService', () => {
  let service: TextUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
