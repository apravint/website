import { TestBed } from '@angular/core/testing';
import { TermsComponent } from './terms.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('TermsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsComponent, RouterTestingModule]
    }).compileComponents();
  });

  it('should create and render heading', () => {
    const fixture = TestBed.createComponent(TermsComponent);
    const el: HTMLElement = fixture.nativeElement;
    fixture.detectChanges();
    expect(el.querySelector('h1')?.textContent).toContain('Terms and Conditions');
  });
});
