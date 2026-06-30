import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { LegalComponent } from './legal/legal.component';

export const routes: Routes = [
	{ path: 'home', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'legal', component: LegalComponent },
	// Deep-link support for old URLs
	{
		path: 'privacy',
		loadComponent: () => import('./privacy/privacy.component').then(m => m.PrivacyComponent)
	},
	{
		path: 'security',
		loadComponent: () => import('./security/security.component').then(m => m.SecurityComponent)
	},
	{ path: 'terms', component: LegalComponent, data: { tab: 'terms' } },
	{
		path: 'kavithai',
		loadComponent: () => import('./kavithai/kavithai.component').then(m => m.KavithaiComponent)
	},
	{
		path: 'ai-assistant',
		loadComponent: () => import('./ai-assistant/ai-assistant.component').then(m => m.AiAssistantComponent)
	},
	{
		path: 'market',
		loadComponent: () => import('./market-prices/market-prices.component').then(m => m.MarketPricesComponent)
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
	{
		path: 'worldcup',
		loadComponent: () => import('./world-cup/world-cup.component').then(m => m.WorldCupComponent)
	},
	{
		path: 'calendar',
		loadComponent: () => import('./tamil-calendar/tamil-calendar.component').then(m => m.TamilCalendarComponent)
	},
	{
		path: 'thirukkural',
		loadComponent: () => import('./thirukkural/thirukkural.component').then(m => m.ThirukkuralComponent)
	},
	{ path: 'thirukural', redirectTo: '/thirukkural', pathMatch: 'full' },
	{ path: 'kural', redirectTo: '/thirukkural', pathMatch: 'full' },
	{
		path: 'videos',
		loadComponent: () => import('./videos/videos.component').then(m => m.VideosComponent)
	},
	{
		path: 'wallpapers',
		loadComponent: () => import('./wallpapers/wallpapers.component').then(m => m.WallpapersComponent)
	},
	{
		path: 'linux',
		loadComponent: () => import('./linux/linux.component').then(m => m.LinuxComponent)
	},
	{ path: '', redirectTo: '/home', pathMatch: 'full' }
];
