import { Component } from '@angular/core';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [AdUnitComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'About - Tamil Kavithai & Pravin Tamilan',
      description: 'Learn about the mission behind Tamil Kavithai, a curated collection of Tamil poetry and literary works.',
      url: 'https://pravintamilan.com/about'
    });
  }
}
