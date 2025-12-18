import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { routes } from './app.routes';

describe('App routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)]
    });
  });

  it('should navigate to /home', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigate(['/home']);
    expect(location.path()).toBe('/home');
  });

  it('should navigate to /about', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigate(['/about']);
    expect(location.path()).toBe('/about');
  });

  it('should navigate to /privacy', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigate(['/privacy']);
    expect(location.path()).toBe('/privacy');
  });
});