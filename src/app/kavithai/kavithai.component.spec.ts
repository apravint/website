import { TestBed } from '@angular/core/testing';
import { KavithaiComponent } from './kavithai.component';
import { of, throwError } from 'rxjs';
import { KavithaiService } from './kavithai.service';
import { SeoService } from '../shared/seo.service';

describe('KavithaiComponent', () => {
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    seoSpy = jasmine.createSpyObj('SeoService', ['updateMetaTags']);
    await TestBed.configureTestingModule({
      imports: [KavithaiComponent],
      providers: [
        { provide: KavithaiService, useValue: { getKavithaigal: () => of([]) } },
        { provide: SeoService, useValue: seoSpy }
      ]
    }).compileComponents();
  });

  it('calls seo.updateMetaTags on construction', () => {
    const fixture = TestBed.createComponent(KavithaiComponent);
    expect(seoSpy.updateMetaTags).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Poems - Tamil Kavithai' }));
  });

  it('sets loading false and clears error on successful fetch', () => {
    // override provider to return data
    TestBed.overrideProvider(KavithaiService, { useValue: { getKavithaigal: () => of([{ id: '1', title: 'T', description: '', email: '', user: '' }]) } });
    const fixture = TestBed.createComponent(KavithaiComponent);
    const comp = fixture.componentInstance as any;

    comp.kavithaigal$.subscribe((data: any) => {
      expect(data.length).toBeGreaterThan(0);
      expect(comp.loading).toBeFalse();
      expect(comp.errorMessage).toBe('');
    });
  });

  it('sets errorMessage on fetch error', (done) => {
    TestBed.overrideProvider(KavithaiService, { useValue: { getKavithaigal: () => { return throwError(() => new Error('fail')); } } });
    const fixture = TestBed.createComponent(KavithaiComponent);
    const comp = fixture.componentInstance as any;

    comp.kavithaigal$.subscribe({
      next: (data: any) => {
        // should receive empty array per catchError
        expect(Array.isArray(data)).toBeTrue();
        expect(comp.loading).toBeFalse();
        expect(comp.errorMessage).toContain('fail');
        done();
      },
      error: (err: any) => done.fail(err)
    });
  });

  it('sets errorMessage text when error has no message property', (done) => {
    TestBed.overrideProvider(KavithaiService, { useValue: { getKavithaigal: () => { return throwError(() => 'failstring'); } } });
    const fixture = TestBed.createComponent(KavithaiComponent);
    const comp = fixture.componentInstance as any;

    comp.kavithaigal$.subscribe({
      next: (data: any) => {
        expect(Array.isArray(data)).toBeTrue();
        expect(comp.loading).toBeFalse();
        expect(comp.errorMessage).toContain('failstring');
        done();
      },
      error: (err: any) => done.fail(err)
    });
  });
});