import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPricesService, MarketData } from '../shared/services/market-prices.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-market-prices',
  standalone: true,
  imports: [CommonModule, TranslatePipe, AdUnitComponent],
  template: `
    <section class="animate-fade-in">
      <div class="page-hero">
        <div class="bg-glow"></div>
        <div class="container">
          <h1><span class="text-gradient">{{ 'MARKET.TITLE' | translate }} 📈</span></h1>
          <p class="lead">{{ 'MARKET.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="container">
        <!-- Top Ad -->
        <div class="card centered ad-card">
          <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
          <app-ad-unit adSlot="1234567890"></app-ad-unit>
        </div>

        <div class="price-grid" *ngIf="prices; else loading">
          <!-- Bitcoin Card -->
          <div class="card price-card">
            <div class="card-icon btc-icon">₿</div>
            <div class="card-info">
              <h3>Bitcoin (BTC)</h3>
              <div class="price-value" *ngIf="prices.bitcoin; else btcError">
                {{ prices.bitcoin | currency:'USD':'symbol':'1.0-2' }}
              </div>
              <ng-template #btcError><div class="error-text">Unavailable</div></ng-template>
            </div>
          </div>

          <!-- Gold Card -->
          <div class="card price-card">
            <div class="card-icon gold-icon">📀</div>
            <div class="card-info">
              <h3>Gold (XAU)</h3>
              <div class="price-value" *ngIf="prices.gold; else goldError">
                {{ prices.gold | currency:'USD':'symbol':'1.0-2' }}
              </div>
              <ng-template #goldError><div class="error-text">Key Required</div></ng-template>
              <span class="unit" *ngIf="prices.gold">per oz</span>
            </div>
          </div>

          <!-- Silver Card -->
          <div class="card price-card">
            <div class="card-icon silver-icon">⚪</div>
            <div class="card-info">
              <h3>Silver (XAG)</h3>
              <div class="price-value" *ngIf="prices.silver; else silverError">
                {{ prices.silver | currency:'USD':'symbol':'1.0-2' }}
              </div>
              <ng-template #silverError><div class="error-text">Key Required</div></ng-template>
              <span class="unit" *ngIf="prices.silver">per oz</span>
            </div>
          </div>
        </div>

        <ng-template #loading>
          <div class="loading-state centered">
            <div class="spinner"></div>
            <p class="muted">{{ 'MARKET.LOADING' | translate }}</p>
          </div>
        </ng-template>

        <!-- Bottom Ad -->
        <div class="card centered ad-card">
          <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
          <app-ad-unit adSlot="1234567890"></app-ad-unit>
        </div>

        <div class="footer-actions centered">
          <span class="update-time muted" *ngIf="lastUpdated">
             {{ 'MARKET.LAST_UPDATED' | translate }}: {{ lastUpdated | date:'shortTime' }}
          </span>
          <button class="refresh-btn" (click)="fetchPrices()" [disabled]="isRefreshing">
             🔄 {{ isRefreshing ? 'Refreshing...' : 'Refresh Prices' }}
          </button>
          <p class="muted data-source">Data provided by CoinGecko & GoldAPI.io</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .price-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-3);
      margin: var(--space-4) 0;
    }

    .price-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .card-icon {
      font-size: 2.5rem;
      width: 70px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(79, 70, 229, 0.1);
      border-radius: var(--radius);
    }

    .btc-icon { color: #f7931a; background: rgba(247, 147, 26, 0.1); }
    .gold-icon { color: #facc15; background: rgba(250, 204, 21, 0.1); }
    .silver-icon { color: #64748b; background: rgba(100, 116, 139, 0.1); }

    .card-info h3 {
      color: var(--muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .price-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text);
    }

    .unit {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .loading-state {
      padding: var(--space-4) 0;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--border);
      border-left-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto var(--space-2);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .ad-card {
      margin-bottom: var(--space-3);
    }

    .footer-actions {
      margin-top: var(--space-4);
      padding-top: var(--space-3);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .update-time {
      font-size: 0.8rem;
      background: var(--surface);
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }

    .refresh-btn {
      background: var(--accent);
      color: #fff;
      border: none;
      padding: 12px 28px;
      border-radius: var(--radius);
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.2s;
      
      &:hover:not(:disabled) {
        background: var(--accent-hover);
        transform: scale(1.03);
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .data-source {
      font-size: 0.8rem;
      margin-top: var(--space-2);
    }

    .error-text {
      color: #ef4444;
      font-size: 1rem;
      font-weight: 500;
    }

    .text-gradient {
      background: linear-gradient(to right, var(--accent), #d946ef);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class MarketPricesComponent implements OnInit {
  prices?: MarketData;
  isRefreshing = false;
  lastUpdated?: Date;

  constructor(
    private marketService: MarketPricesService,
    private seo: SeoService,
    private translation: TranslationService
  ) { }

  ngOnInit() {
    this.updateSeo();
    this.fetchPrices();
  }

  private updateSeo() {
    const title = this.translation.translate('MARKET.SEO_TITLE');
    const desc = this.translation.translate('MARKET.SEO_DESC');
    this.seo.updateMetaTags({
      title: title,
      description: desc
    });
  }

  fetchPrices() {
    this.isRefreshing = true;
    this.marketService.getMarketPrices().subscribe({
      next: (data) => {
        this.prices = data;
        this.isRefreshing = false;
        this.lastUpdated = new Date();
      },
      error: (err) => {
        console.error('Error fetching market prices:', err);
        this.isRefreshing = false;
      }
    });
  }
}
