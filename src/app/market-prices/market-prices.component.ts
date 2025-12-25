import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketPricesService, MarketData } from '../shared/services/market-prices.service';
import { TranslatePipe } from '../shared/translate.pipe';

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
          <div class="price-card btc">
            <div class="card-icon">₿</div>
            <div class="card-info">
              <h3>Bitcoin (BTC)</h3>
              <div class="price-value">{{ prices.bitcoin | currency:'USD':'symbol':'1.0-2' }}</div>
            </div>
          </div>

          <!-- Gold Card -->
          <div class="price-card gold">
            <div class="card-icon">📀</div>
            <div class="card-info">
              <h3>Gold (XAU)</h3>
              <div class="price-value">{{ prices.gold | currency:'USD':'symbol':'1.0-2' }}</div>
              <span class="unit">per oz</span>
            </div>
          </div>

          <!-- Silver Card -->
          <div class="price-card silver">
            <div class="card-icon">⚪</div>
            <div class="card-info">
              <h3>Silver (XAG)</h3>
              <div class="price-value">{{ prices.silver | currency:'USD':'symbol':'1.0-2' }}</div>
              <span class="unit">per oz</span>
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
          <p>Data provided by CoinGecko & GoldAPI.io</p>
          <button class="refresh-btn" (click)="fetchPrices()" [disabled]="isRefreshing">
             {{ isRefreshing ? 'Refreshing...' : 'Refresh Prices' }}
          </button>
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
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      
      &:hover {
        transform: translateY(-10px);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }

    .card-icon {
      font-size: 3rem;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
    }

    .card-info {
      h3 {
        color: #94a3b8;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 5px;
      }
      .price-value {
        font-size: 1.8rem;
        font-weight: 700;
      }
      .unit {
        font-size: 0.8rem;
        color: #64748b;
      }
    }

    /* Gradient accents */
    .btc .card-icon { color: #f7931a; }
    .gold .card-icon { color: #facc15; }
    .silver .card-icon { color: #cbd5e1; }

    .loading-state {
      text-align: center;
      padding: 100px 0;
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-left-color: #60a5fa;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .market-footer {
      text-align: center;
      color: #64748b;
      font-size: 0.9rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
    }

    .refresh-btn {
      background: #334155;
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 10px 25px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        background: #475569;
        border-color: rgba(255, 255, 255, 0.2);
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  `]
})
export class MarketPricesComponent implements OnInit {
    prices?: MarketData;
    isRefreshing = false;

    constructor(private marketService: MarketPricesService) { }

    ngOnInit() {
        this.fetchPrices();
    }

    fetchPrices() {
        this.isRefreshing = true;
        this.marketService.getMarketPrices().subscribe({
            next: (data) => {
                this.prices = data;
                this.isRefreshing = false;
            },
            error: (err) => {
                console.error('Error fetching market prices:', err);
                this.isRefreshing = false;
            }
        });
    }
}
