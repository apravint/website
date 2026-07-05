import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';
import { AnalyticsService } from '../shared/services/analytics.service';

@Component({
    selector: 'app-download',
    standalone: true,
    imports: [TranslatePipe],
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit, OnDestroy {
    playStoreUrl = 'https://play.google.com/store/apps/details?id=io.ionic.starter.pravintest1&hl=en';
    simTime = '12:00';
    private timeInterval: any;

    constructor(
        private seo: SeoService,
        private analytics: AnalyticsService
    ) {
        this.seo.updateMetaTags({
            title: 'Download - Tamil Kavithai App',
            description: 'Get the Tamil Kavithai mobile app on Google Play Store and enjoy daily poems.',
            url: 'https://pravintamilan.com/download'
        });
    }

    ngOnInit() {
        this.updateTime();
        if (typeof window !== 'undefined') {
            this.timeInterval = setInterval(() => this.updateTime(), 60000);
        }
    }

    ngOnDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    private updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // formatting 0 to 12
        this.simTime = `${hours}:${minutes} ${ampm}`;
    }

    openPlayStore() {
        this.analytics.logCustomEvent('download_app_clicked', { platform: 'play_store' });
        window.open(this.playStoreUrl, '_blank');
    }
}
