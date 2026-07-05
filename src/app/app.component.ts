import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { BackToTopComponent } from './shared/components/back-to-top/back-to-top.component';
import { AnalyticsService } from './shared/services/analytics.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, BackToTopComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'website';
  private analytics = inject(AnalyticsService);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const isPreview = window.location.search.includes('preview=true') || window.location.hash.includes('preview=true');
      this.analytics.logCustomEvent('app_initialized', { is_preview: isPreview });
      
      if (isPreview) {
        document.body.classList.add('app-preview-mode');
      }
    }
  }
}
