import { TestBed } from '@angular/core/testing';

import { UxToolsService } from './ux-tools.service';

describe('UxToolsService', () => {
  let service: UxToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UxToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
