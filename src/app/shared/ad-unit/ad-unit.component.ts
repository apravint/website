import { Component, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
          [attr.data-ad-slot]="adSlot"
          [attr.data-ad-format]="adFormat"
          [attr.data-full-width-responsive]="fullWidthResponsive">
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
  @Input() adClient = 'YOUR_ADSENSE_CLIENT_ID';
  @Input() adSlot: string = ''; 
  @Input() adFormat = 'auto';
  @Input() fullWidthResponsive = true;

  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser && this.adSlot) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }
}
