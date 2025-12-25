import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdUnitComponent } from './ad-unit.component';
import { PLATFORM_ID } from '@angular/core';

describe('AdUnitComponent', () => {
  let fixture: ComponentFixture<AdUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdUnitComponent], providers: [{ provide: PLATFORM_ID, useValue: 'browser' }] }).compileComponents();
    fixture = TestBed.createComponent(AdUnitComponent);
  });

  it('should log error when adsbygoogle push throws', () => {
    const comp = fixture.componentInstance;
    comp.adSlot = '123';

    // make adsbygoogle.push throw
    (window as any).adsbygoogle = { push: () => { throw new Error('boom'); } };
    spyOn(console, 'error');

    // call lifecycle
    comp.ngAfterViewInit();

    expect((console.error as jasmine.Spy).calls.count()).toBeGreaterThan(0);
  });
});