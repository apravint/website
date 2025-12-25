import { Component } from '@angular/core';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
    selector: 'app-download',
    standalone: true,
    imports: [TranslatePipe],
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent {
    playStoreUrl = 'https://play.google.com/store/apps/details?id=io.ionic.starter.pravintest1&hl=en';

    openPlayStore() {
        window.open(this.playStoreUrl, '_blank');
    }
}
