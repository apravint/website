import { Component, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ad-unit',
  standalone: true,
  imports: [],
  template: `
    @if (isBrowser) {
      <div class="ad-container">
        <ins class="adsbygoogle"
          style="display:block"
          [attr.data-ad-client]="adClient"
          data-ad-format="auto"
          data-full-width-responsive="true">
        </ins>
      </div>
    }
    `,
  styles: [`
    .ad-container {
      display: block;
      width: 100%;
      margin: 20px 0;
      text-align: center;
      min-height: 90px; /* Prevent layout shift */
    }
  `]
})
export class AdUnitComponent implements AfterViewInit {
  adClient = environment.adClient;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }
}
