import { TestBed } from '@angular/core/testing';

import { DataEncryptionService } from './data-encryption.service';

describe('DataEncryptionService', () => {
  let service: DataEncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataEncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
