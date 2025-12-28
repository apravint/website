import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { NavbarComponent, getPreferredTheme, getPreferredColor } from './navbar.component';
import { TranslationService } from '../shared/translation.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let translationSpy: jasmine.SpyObj<TranslationService> & { currentLang$: BehaviorSubject<string> };

  beforeEach(async () => {
    translationSpy = jasmine.createSpyObj('TranslationService', ['setLanguage', 'translate']) as any;
    translationSpy.currentLang$ = new BehaviorSubject<string>('en');
    translationSpy.translations$ = new BehaviorSubject<any>({});
    translationSpy.translate.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule],
      providers: [{ provide: TranslationService, useValue: translationSpy }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle theme and set data-theme on document', () => {
    // ensure a clean slate
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');

    component.theme = 'light';
    component.toggleTheme();
    const themeAfter = component.theme;

    const dataTheme = document.documentElement.getAttribute('data-theme');
    expect(dataTheme).toBe(themeAfter);
    expect(localStorage.getItem('theme')).toBe(themeAfter);

    // toggle back
    component.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(themeAfter);
  });

  it('should toggle language and call translation service', () => {
    component.currentLang = 'en';
    component.toggleLanguage();
    expect(translationSpy.setLanguage).toHaveBeenCalledWith('ta');

    component.currentLang = 'ta';
    component.toggleLanguage();
    expect(translationSpy.setLanguage).toHaveBeenCalledWith('en');
  });

  it('should set color theme and toggle settings and menu', () => {
    component.setColorTheme('rose');
    expect(component.colorTheme).toBe('rose');

    expect(component.showSettings).toBeFalse();
    component.toggleSettings();
    expect(component.showSettings).toBeTrue();

    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();

    component.closeMenu();
    expect(component.menuOpen).toBeFalse();
    expect(component.showSettings).toBeFalse();
  });

  it('should respect system theme preference when no stored theme', () => {
    // remove stored theme
    localStorage.removeItem('theme');
    // stub matchMedia
    const orig = (window as any).matchMedia;
    (window as any).matchMedia = () => ({ matches: true });

    const fixture2 = TestBed.createComponent(NavbarComponent);
    fixture2.detectChanges();
    const comp2 = fixture2.componentInstance;

    expect(comp2.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // restore
    (window as any).matchMedia = orig;
  });

  it('should default color theme to indigo when none stored', () => {
    localStorage.removeItem('color-theme');
    localStorage.removeItem('theme');
    expect(localStorage.getItem('color-theme')).toBeNull();

    const fixture2 = TestBed.createComponent(NavbarComponent);
    fixture2.detectChanges();
    const comp2 = fixture2.componentInstance;
    expect(comp2.colorTheme).toBe('indigo');
    expect(document.documentElement.getAttribute('data-color')).toBe('indigo');
  });

  it('should default color theme to indigo when none stored (no theme)', () => {
    localStorage.removeItem('color-theme');
    localStorage.removeItem('theme');
    const fixture2 = TestBed.createComponent(NavbarComponent);
    fixture2.detectChanges();
    const comp2 = fixture2.componentInstance;
    expect(comp2.colorTheme).toBe('indigo');
    expect(document.documentElement.getAttribute('data-color')).toBe('indigo');
  });

  it('applyTheme and applyColor should set document attributes', async () => {
    // reset
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color');

    const mod = await import('./navbar.component');
    const { applyTheme, applyColor } = mod;
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    applyColor('rose');
    expect(document.documentElement.getAttribute('data-color')).toBe('rose');
  });

  it('getPreferredTheme and getPreferredColor should respect stored and system preferences', () => {
    // stored theme
    localStorage.setItem('theme', 'dark');
    expect(getPreferredTheme()).toBe('dark');
    localStorage.setItem('theme', 'light');
    expect(getPreferredTheme()).toBe('light');

    // no stored theme, system prefers dark
    localStorage.removeItem('theme');
    const orig = (window as any).matchMedia;
    (window as any).matchMedia = () => ({ matches: true });
    expect(getPreferredTheme()).toBe('dark');
    (window as any).matchMedia = () => ({ matches: false });
    expect(getPreferredTheme()).toBe('light');
    (window as any).matchMedia = orig;

    // preferred color
    localStorage.setItem('color-theme', 'rose');
    expect(getPreferredColor()).toBe('rose');
    localStorage.removeItem('color-theme');
    expect(getPreferredColor()).toBe('indigo');
  });

  it('getPreferredTheme should return light when window is undefined (isolated eval)', () => {
    // Execute the function in an isolated scope where window and localStorage are undefined
    const code = "'use strict'; const window = undefined; const localStorage = undefined; return (" + getPreferredTheme.toString() + ")();";
    const res = new Function(code)();
    expect(res).toBe('light');
  });

  it('should handle missing global localStorage and matchMedia', () => {
    const origLS = (window as any).localStorage;
    const origMatch = (window as any).matchMedia;

    // Use spyOnProperty to mock non-writable globals safely
    const lsSpy = spyOnProperty(window as any, 'localStorage', 'get').and.returnValue(undefined);
    // matchMedia is a function, spy it directly
    const mmSpy = spyOn(window as any, 'matchMedia').and.returnValue(undefined as any);

    expect(getPreferredTheme()).toBe('light');
    expect(getPreferredColor()).toBe('indigo');

    // restore original behavior
    lsSpy.and.returnValue(origLS);
    mmSpy.and.returnValue(origMatch);
  });
});
