import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { HomeDetailComponent } from './home/home-detail.component';
import { AboutDetailComponent } from './about/about-detail.component';
import { PrivacyDetailComponent } from './privacy/privacy-detail.component';

export const routes: Routes = [
	{ path: 'home', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'privacy', component: PrivacyComponent },
	{ path: 'home/detail', component: HomeDetailComponent },
	{ path: 'about/detail', component: AboutDetailComponent },
	{ path: 'privacy/detail', component: PrivacyDetailComponent },
	{ path: '', redirectTo: '/home', pathMatch: 'full' }
];
