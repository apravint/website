import { Component } from '@angular/core';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [AdUnitComponent, TranslatePipe],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'Privacy Policy - Tamil Kavithai',
      description: 'Privacy Policy for Tamil Kavithai app and website. Learn how we handle your data.',
      url: 'https://pravintamilan.com/privacy'
    });
  }
}
