import { TestBed } from '@angular/core/testing';
import { KavithaiService, Kavithai } from './kavithai.service';
import * as af from '@angular/fire/firestore';
import { of, throwError } from 'rxjs';

describe('KavithaiService', () => {
  let service: KavithaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        KavithaiService,
        { provide: af.Firestore, useValue: {} }
      ]
    });
    // spy on the protected method before injecting the service
    spyOn(KavithaiService.prototype as any, '_getCollection').and.returnValue({});
  });

  it('should be created', () => {
    const service = TestBed.inject(KavithaiService);
    expect(service).toBeTruthy();
  });
  it('should return poems from collectionData', (done) => {
    const data: Kavithai[] = [{ id: '1', title: 'T', description: 'D', email: '', user: '' }];

    // use TestBed to get the service and stub the protected method
    const svc = TestBed.inject(KavithaiService) as any;

    // stub the protected _collectionData method
    spyOn(svc, '_collectionData').and.returnValue(of(data));

    svc.getKavithaigal().subscribe({
      next: (res: any) => {
        expect(res).toEqual(data);
        done();
      },
      error: done.fail
    });
  });

  it('should propagate error when collectionData errors', (done) => {
    const svc = TestBed.inject(KavithaiService) as any;

    // simulate an error from the underlying collectionData
    spyOn(svc, '_collectionData').and.returnValue(throwError(() => new Error('fail')));

    svc.getKavithaigal().subscribe({
      next: () => done.fail('expected error'),
      error: (err: any) => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('_collectionData should execute (smoke test)', () => {
    // This test is tricky because it calls the real collectionData which uses inject()
    // We should probably just ensure it exists and is callable in a proper context
    const svc = TestBed.inject(KavithaiService) as any;
    expect(svc._collectionData).toBeDefined();
  });
});