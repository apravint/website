import { TestBed } from '@angular/core/testing';
import { DownloadComponent } from './download.component';
import { SeoService } from '../shared/seo.service';

describe('DownloadComponent', () => {
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(async () => {
    seoSpy = jasmine.createSpyObj('SeoService', ['updateMetaTags']);
    await TestBed.configureTestingModule({
      imports: [DownloadComponent],
      providers: [ { provide: SeoService, useValue: seoSpy } ]
    }).compileComponents();
  });

  it('calls seo.updateMetaTags in constructor', () => {
    const fixture = TestBed.createComponent(DownloadComponent);
    expect(seoSpy.updateMetaTags).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Download - Tamil Kavithai App' }));
  });

  it('opens play store when openPlayStore called', () => {
    const fixture = TestBed.createComponent(DownloadComponent);
    const comp = fixture.componentInstance as any;
    spyOn(window, 'open');
    comp.openPlayStore();
    expect(window.open).toHaveBeenCalled();
  });
});