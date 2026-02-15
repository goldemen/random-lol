/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChampionsService } from './champions.service';

describe('Service: Champions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChampionsService]
    });
  });

  it('should ...', inject([ChampionsService], (service: ChampionsService) => {
    expect(service).toBeTruthy();
  }));
});
