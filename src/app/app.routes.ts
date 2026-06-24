import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LegalComponent } from './legal/legal.component';

export const routes: Routes = [
	{ path: 'home', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'legal', component: LegalComponent },
	// Deep-link support for old URLs
	{ path: 'privacy', redirectTo: '/legal?tab=privacy', pathMatch: 'full' },
	{ path: 'terms', redirectTo: '/legal?tab=terms', pathMatch: 'full' },
	{
		path: 'kavithai',
		loadComponent: () => import('./kavithai/kavithai.component').then(m => m.KavithaiComponent)
	},
	{
		path: 'ai-assistant',
		redirectTo: '/kavithai',
		pathMatch: 'full'
	},
	{
		path: 'market',
		redirectTo: '/news',
		pathMatch: 'full'
	},
	{
		path: 'news',
		loadComponent: () => import('./news/news.component').then(m => m.NewsComponent)
	},
	{
		path: 'create',
		loadComponent: () => import('./card-creator/card-creator.component').then(m => m.CardCreatorComponent)
	},
	{
		path: 'download',
		loadComponent: () => import('./download/download.component').then(m => m.DownloadComponent)
	},
	{
		path: 'iptv',
		loadComponent: () => import('./iptv/iptv.component').then(m => m.IptvComponent)
	},
	{
		path: 'tutorials',
		loadComponent: () => import('./tutorials/tutorials.component').then(m => m.TutorialsComponent)
	},
	{
		path: 'terminal',
		loadComponent: () => import('./terminal/terminal.component').then(m => m.TerminalComponent)
	},
	{ path: '', redirectTo: '/home', pathMatch: 'full' }
];
