import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';

export const routes: Routes = [
	{ path: 'home', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'privacy', component: PrivacyComponent },
	{ path: 'terms', component: TermsComponent },
	{
		path: 'kavithai',
		loadComponent: () => import('./kavithai/kavithai.component').then(m => m.KavithaiComponent)
	},
	{
		path: 'download',
		loadComponent: () => import('./download/download.component').then(m => m.DownloadComponent)
	},
	{ path: '', redirectTo: '/home', pathMatch: 'full' }
];
