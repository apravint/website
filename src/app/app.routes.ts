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
	{ path: '', redirectTo: '/home', pathMatch: 'full' }
];
