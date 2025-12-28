import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslationService } from '../shared/translation.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, HomeComponent],
      providers: [
        {
          provide: TranslationService, useValue: {
            translate: (k: string) => {
              if (k.includes('HOME.HERO.TITLE')) return 'Tamil Kavithai';
              return k;
            }, translations$: of({})
          }
        }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render heading and action buttons', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Tamil Kavithai');
    expect(el.querySelectorAll('.btn').length).toBeGreaterThan(0);
  });

  it('should hide greeting after 4 seconds', fakeAsync(() => {
    // showGreeting starts true
    expect(component.showGreeting).toBeTrue();
    component.ngOnInit();
    tick(4000);
    expect(component.showGreeting).toBeFalse();
  }));
});
