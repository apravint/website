import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../shared/seo.service';

@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent implements OnInit {
    constructor(private seo: SeoService) { }

    ngOnInit() {
        this.seo.updateMetaTags({
            title: 'Privacy Policy - Pravin Tamilan',
            description: 'Privacy policy and data handling guidelines for Pravin Tamilan.',
            url: 'https://pravintamilan.com/privacy'
        });
    }
}
