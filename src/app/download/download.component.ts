import { Component } from '@angular/core';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';

@Component({
    selector: 'app-download',
    standalone: true,
    imports: [TranslatePipe],
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent {
    playStoreUrl = 'https://play.google.com/store/apps/details?id=io.ionic.starter.pravintest1&hl=en';

    constructor(private seo: SeoService) {
        this.seo.updateMetaTags({
            title: 'Download - Tamil Kavithai App',
            description: 'Get the Tamil Kavithai mobile app on Google Play Store and enjoy daily poems.',
            url: 'https://pravintamilan.com/download'
        });
    }

    openPlayStore() {
        window.open(this.playStoreUrl, '_blank');
    }
}
