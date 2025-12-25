import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TranslationService] });
  });

  it('loads default translations and can translate keys', async () => {
    spyOn(window as any, 'fetch').and.returnValue(Promise.resolve({ ok: true, json: () => Promise.resolve({ HOME: { TITLE: 'Hello' } }) }));

    service = TestBed.inject(TranslationService);

    // allow async constructor loadTranslations to resolve
    await Promise.resolve();
    await Promise.resolve();

    expect(service.getCurrentLang()).toBe('en');
    expect(service.translate('HOME.TITLE')).toBe('Hello');
    expect(service.translate('NONEXISTENT.KEY')).toBe('NONEXISTENT.KEY');
  });

  it('setLanguage updates language and loads translations', async () => {
    const fetchSpy = spyOn(window as any, 'fetch').and.callFake((url: string) => {
      if (url.includes('ta.json')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ HOME: { TITLE: 'Vanakkam' } }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    service = TestBed.inject(TranslationService);

    await Promise.resolve();

    service.setLanguage('ta');

    // let async loadTranslations finish
    await Promise.resolve();
    await Promise.resolve();

    expect(service.getCurrentLang()).toBe('ta');
    expect(service.translate('HOME.TITLE')).toBe('Vanakkam');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('logs error when translations fail to load', async () => {
    const consoleSpy = spyOn(console, 'error');
    spyOn(window as any, 'fetch').and.returnValue(Promise.resolve({ ok: false, status: 404 }));

    service = TestBed.inject(TranslationService);

    service.setLanguage('fr');

    await Promise.resolve();
    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalled();
  });
});