import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPricesService, MarketData } from '../shared/services/market-prices.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';

@Component({
  selector: 'app-market-prices',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="market-container">
      <div class="content-wrapper">
        <header class="page-header">
          <h1>{{ 'MARKET.TITLE' | translate }} 📈</h1>
          <p>{{ 'MARKET.SUBTITLE' | translate }}</p>
        </header>

        <div class="price-grid" *ngIf="prices; else loading">
          <!-- Bitcoin Card -->
          <div class="price-card btc animate-in" style="--delay: 1">
            <div class="card-glow"></div>
            <div class="card-icon">₿</div>
            <div class="card-info">
              <h3>Bitcoin (BTC)</h3>
              <div class="price-value" *ngIf="prices.bitcoin; else btcError">
                {{ prices.bitcoin | currency:'USD':'symbol':'1.0-2' }}
              </div>
              <ng-template #btcError><div class="error-text">Unavailable</div></ng-template>
            </div>
          </div>

          <!-- Gold Card -->
          <div class="price-card gold animate-in" style="--delay: 2">
            <div class="card-glow"></div>
            <div class="card-icon">📀</div>
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
          <div class="price-card silver animate-in" style="--delay: 3">
            <div class="card-glow"></div>
            <div class="card-icon">⚪</div>
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
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ 'MARKET.LOADING' | translate }}</p>
          </div>
        </ng-template>

        <footer class="market-footer">
          <p class="data-source">Data provided by CoinGecko & GoldAPI.io</p>
          <div class="footer-actions">
            <span class="update-time" *ngIf="lastUpdated">
               {{ 'MARKET.LAST_UPDATED' | translate }}: {{ lastUpdated | date:'shortTime' }}
            </span>
            <button class="refresh-btn" (click)="fetchPrices()" [disabled]="isRefreshing">
               <span class="refresh-icon" [class.spinning]="isRefreshing">🔄</span>
               {{ isRefreshing ? 'Refreshing...' : 'Refresh Prices' }}
            </button>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .market-container {
      min-height: 85vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #fff;
      display: flex;
      justify-content: center;
    }

    .content-wrapper {
      width: 100%;
      max-width: 1000px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 50px;
      h1 {
        font-size: 2.5rem;
        font-weight: 800;
        margin-bottom: 10px;
        background: linear-gradient(to right, #60a5fa, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        color: #94a3b8;
        font-size: 1.1rem;
      }
    }

    .price-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 25px;
      margin-bottom: 50px;
    }

    .price-card {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 35px;
      display: flex;
      align-items: center;
      gap: 24px;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      
      &:hover {
        transform: translateY(-12px) scale(1.02);
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        
        .card-glow { opacity: 1; }
      }
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .animate-in {
      opacity: 0;
      transform: translateY(30px);
      animation: slideUp 0.6s ease forwards;
      animation-delay: calc(var(--delay) * 0.1s);
    }

    @keyframes slideUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-icon {
      font-size: 3.2rem;
      width: 85px;
      height: 85px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 22px;
      box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.02);
    }

    .card-info {
      h3 {
        color: #94a3b8;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
        font-weight: 600;
      }
      .price-value {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.5px;
        background: linear-gradient(to bottom, #fff, #cbd5e1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .unit {
        font-size: 0.75rem;
        color: #64748b;
        margin-left: 4px;
      }
    }

    /* Gradient accents with glows */
    .btc .card-icon { 
      color: #f7931a; 
      box-shadow: 0 0 30px rgba(247, 147, 26, 0.1);
    }
    .gold .card-icon { 
      color: #facc15; 
      box-shadow: 0 0 30px rgba(250, 204, 21, 0.1);
    }
    .silver .card-icon { 
      color: #cbd5e1; 
      box-shadow: 0 0 30px rgba(203, 213, 225, 0.1);
    }

    .loading-state {
      text-align: center;
      padding: 120px 0;
      .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.05);
        border-left-color: #60a5fa;
        border-radius: 50%;
        animation: spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite;
        margin: 0 auto 25px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .market-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-source {
      color: #64748b;
      font-size: 0.85rem;
      margin-bottom: 25px;
    }

    .footer-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .update-time {
      font-size: 0.8rem;
      color: #475569;
      background: rgba(255, 255, 255, 0.03);
      padding: 6px 14px;
      border-radius: 20px;
    }

    .refresh-btn {
      background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 12px 30px;
      border-radius: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        transform: scale(1.05);
        background: linear-gradient(135deg, #475569 0%, #334155 100%);
        border-color: rgba(255, 255, 255, 0.2);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .refresh-icon {
      font-size: 1.1rem;
      &.spinning {
        animation: spin 1s linear infinite;
      }
    }

    .error-text {
      color: #f87171;
      font-size: 1.1rem;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .page-header h1 { font-size: 2rem; }
      .price-card { padding: 25px; }
      .card-icon { width: 70px; height: 70px; font-size: 2.5rem; }
      .price-value { font-size: 1.6rem; }
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
