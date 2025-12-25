import { Component } from '@angular/core';

import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [AdUnitComponent, TranslatePipe],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'Terms & Conditions - Tamil Kavithai',
      description: 'Terms and Conditions for using the Tamil Kavithai app and website.',
      url: 'https://pravintamilan.com/terms'
    });
  }
}
