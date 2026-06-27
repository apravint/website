import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../shared/seo.service';

@Component({
    selector: 'app-legal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './legal.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./legal.component.scss']
})
export class LegalComponent implements OnInit {
    activeTab: 'privacy' | 'terms' = 'privacy';

    constructor(
        private seo: SeoService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Check route data first
        const routeDataTab = this.route.snapshot.data['tab'];
        if (routeDataTab === 'terms' || routeDataTab === 'privacy') {
            this.activeTab = routeDataTab;
            this.updateSeo();
            return;
        }

        // Check query param or route data for initial tab
        this.route.queryParams.subscribe(params => {
            if (params['tab'] === 'terms') {
                this.activeTab = 'terms';
            } else {
                this.activeTab = 'privacy';
            }
            this.updateSeo();
        });
    }

    selectTab(tab: 'privacy' | 'terms') {
        this.activeTab = tab;
        this.updateSeo();
    }

    private updateSeo() {
        if (this.activeTab === 'privacy') {
            this.seo.updateMetaTags({
                title: 'Privacy Policy - Pravin Tamilan',
                description: 'Privacy policy for Pravin Tamilan app and website.',
                url: 'https://pravintamilan.com/legal'
            });
        } else {
            this.seo.updateMetaTags({
                title: 'Terms & Conditions - Pravin Tamilan',
                description: 'Terms and conditions for using Pravin Tamilan app and website.',
                url: 'https://pravintamilan.com/legal'
            });
        }
    }
}
