import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../shared/seo.service';

@Component({
    selector: 'app-security',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './security.component.html',
    styleUrls: ['./security.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityComponent implements OnInit {
    constructor(private seo: SeoService) { }

    ngOnInit() {
        this.seo.updateMetaTags({
            title: 'Security Policy - Pravin Tamilan',
            description: 'Security protocols, encryption, and data protection policies for Pravin Tamilan.',
            url: 'https://pravintamilan.com/security'
        });
    }
}
