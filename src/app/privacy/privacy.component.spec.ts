import { TestBed } from '@angular/core/testing';
import { PrivacyComponent } from './privacy.component';
import { SeoService } from '../shared/seo.service';

describe('PrivacyComponent', () => {
  it('calls updateMetaTags in constructor', () => {
    const seoSpy = jasmine.createSpyObj('SeoService', ['updateMetaTags']);
    TestBed.configureTestingModule({ providers: [PrivacyComponent, { provide: SeoService, useValue: seoSpy }] });

    // instantiate via TestBed to run constructor
    const comp = TestBed.inject(PrivacyComponent);
    expect(seoSpy.updateMetaTags).toHaveBeenCalled();
  });
});