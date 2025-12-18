import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent, RouterTestingModule]
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

    const btnThemeBefore = component.theme;
    component.toggleTheme();
    const themeAfter = component.theme;

    const dataTheme = document.documentElement.getAttribute('data-theme');
    expect(dataTheme).toBe(themeAfter);
    expect(localStorage.getItem('theme')).toBe(themeAfter);

    // toggle back
    component.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(themeAfter);
  });
});
