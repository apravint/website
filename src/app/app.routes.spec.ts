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

  it('has kavithai route configured and loadComponent works', async () => {
    const kav = routes.find(r => r.path === 'kavithai') as any;
    expect(kav).toBeTruthy();
    expect(kav.loadComponent).toBeTruthy();

    const loaded = await kav.loadComponent();
    expect(loaded?.name || loaded?.KavithaiComponent?.name).toBeTruthy();
  });

  it('download route loadComponent works', async () => {
    const d = routes.find(r => r.path === 'download') as any;
    expect(d).toBeTruthy();
    const loaded = await d.loadComponent();
    expect(loaded?.name || loaded?.DownloadComponent?.name).toBeTruthy();
  });

  it('redirects empty path to /home', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['']);
    expect(router.url).toBe('/home');
  });
});