import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketPricesService, MarketData } from '../shared/services/market-prices.service';
import { StockService, StockQuote, SearchResult, IndicesData } from '../shared/services/stock.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SparklineComponent } from '../shared/components/sparkline/sparkline.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-market-prices',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, AdUnitComponent, SparklineComponent],
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

        <!-- Indian Indices Section -->
        <div class="section-header">
          <h2>🇮🇳 {{ 'MARKET.INDICES_TITLE' | translate }}</h2>
        </div>
        <div class="price-grid" *ngIf="indices; else indicesLoading">
          <!-- Nifty 50 Card -->
          <div class="card price-card index-card">
            <div class="card-icon nifty-icon">📊</div>
            <div class="card-info">
              <h3>NIFTY 50</h3>
              <div class="price-value" *ngIf="indices.nifty50; else niftyError">
                ₹{{ indices.nifty50.price | number:'1.2-2' }}
              </div>
              <ng-template #niftyError><div class="error-text">{{ 'MARKET.API_KEY_REQUIRED' | translate }}</div></ng-template>
              <div class="change-indicator" *ngIf="indices.nifty50" [class.up]="indices.nifty50.isUp" [class.down]="!indices.nifty50.isUp">
                {{ indices.nifty50.isUp ? '▲' : '▼' }} {{ indices.nifty50.change | number:'1.2-2' }} ({{ indices.nifty50.percentChange | number:'1.2-2' }}%)
              </div>
            </div>
          </div>

          <!-- Sensex Card -->
          <div class="card price-card index-card">
            <div class="card-icon sensex-icon">📈</div>
            <div class="card-info">
              <h3>SENSEX</h3>
              <div class="price-value" *ngIf="indices.sensex; else sensexError">
                ₹{{ indices.sensex.price | number:'1.2-2' }}
              </div>
              <ng-template #sensexError><div class="error-text">{{ 'MARKET.API_KEY_REQUIRED' | translate }}</div></ng-template>
              <div class="change-indicator" *ngIf="indices.sensex" [class.up]="indices.sensex.isUp" [class.down]="!indices.sensex.isUp">
                {{ indices.sensex.isUp ? '▲' : '▼' }} {{ indices.sensex.change | number:'1.2-2' }} ({{ indices.sensex.percentChange | number:'1.2-2' }}%)
              </div>
            </div>
          </div>
        </div>

        <ng-template #indicesLoading>
          <div class="loading-state centered">
            <div class="spinner"></div>
            <p class="muted">Loading indices...</p>
          </div>
        </ng-template>

        <!-- Stock Search Section -->
        <div class="section-header">
          <h2>🔍 {{ 'MARKET.SEARCH_TITLE' | translate }}</h2>
        </div>
        <div class="search-container">
          <input 
            type="text" 
            class="search-input"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="'MARKET.SEARCH_PLACEHOLDER' | translate"
          />
          <div class="search-results" *ngIf="searchResults.length > 0">
            <div 
              class="search-result-item" 
              *ngFor="let result of searchResults"
              (click)="selectStock(result)"
            >
              <div class="result-symbol">{{ result.symbol }}</div>
              <div class="result-details">
                <span class="result-name">{{ result.name }}</span>
                <span class="result-exchange">{{ result.exchange }} · {{ result.country }}</span>
              </div>
            </div>
          </div>
          <div class="no-results" *ngIf="searchQuery.length >= 2 && searchResults.length === 0 && !isSearching">
            {{ 'MARKET.NO_RESULTS' | translate }}
          </div>
        </div>

        <!-- Selected Stock Quote -->
        <div class="card price-card selected-stock" *ngIf="selectedStock">
          <div class="card-icon stock-icon">💹</div>
          <div class="card-info">
            <h3>{{ selectedStock.symbol }} <span class="stock-exchange">{{ selectedStock.exchange }}</span></h3>
            <div class="stock-name">{{ selectedStock.name }}</div>
            <div class="price-value">
              {{ selectedStock.currency === 'INR' ? '₹' : '$' }}{{ selectedStock.price | number:'1.2-2' }}
            </div>
            <div class="change-indicator" [class.up]="selectedStock.isUp" [class.down]="!selectedStock.isUp">
              {{ selectedStock.isUp ? '▲' : '▼' }} {{ selectedStock.change | number:'1.2-2' }} ({{ selectedStock.percentChange | number:'1.2-2' }}%)
            </div>
            <div class="stock-details">
              <span>Open: {{ selectedStock.open | number:'1.2-2' }}</span>
              <span>High: {{ selectedStock.high | number:'1.2-2' }}</span>
              <span>Low: {{ selectedStock.low | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Crypto & Metals Section -->
        <div class="section-header">
          <h2>💰 {{ 'MARKET.CRYPTO_METALS' | translate }}</h2>
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
              <app-sparkline *ngIf="btcHistory.length > 0" [data]="btcHistory" [width]="100" [height]="32"></app-sparkline>
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
              <app-sparkline *ngIf="goldHistory.length > 0" [data]="goldHistory" [width]="100" [height]="32"></app-sparkline>
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
              <app-sparkline *ngIf="silverHistory.length > 0" [data]="silverHistory" [width]="100" [height]="32"></app-sparkline>
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
          <button class="refresh-btn" (click)="refreshAll()" [disabled]="isRefreshing">
             🔄 {{ isRefreshing ? 'Refreshing...' : 'Refresh Prices' }}
          </button>
          <p class="muted data-source">Data: CoinGecko, GoldAPI.io & Twelve Data</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .section-header {
      margin: var(--space-4) 0 var(--space-2);
      h2 {
        font-size: 1.3rem;
        color: var(--text);
        margin: 0;
      }
    }

    .price-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .price-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .index-card {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
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
    .nifty-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .sensex-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .stock-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }

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

    .change-indicator {
      font-size: 0.9rem;
      font-weight: 600;
      margin-top: 4px;
      &.up { color: #10b981; }
      &.down { color: #ef4444; }
    }

    /* Search Section */
    .search-container {
      position: relative;
      margin-bottom: var(--space-4);
    }

    .search-input {
      width: 100%;
      padding: 16px 20px;
      font-size: 1rem;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
      color: var(--text);
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }
      &::placeholder {
        color: var(--muted);
      }
    }

    .search-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      max-height: 300px;
      overflow-y: auto;
      z-index: 100;
      margin-top: 4px;
    }

    .search-result-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
      transition: background 0.15s;
      &:hover {
        background: rgba(79, 70, 229, 0.05);
      }
      &:last-child {
        border-bottom: none;
      }
    }

    .result-symbol {
      font-weight: 700;
      color: var(--accent);
      min-width: 80px;
    }

    .result-details {
      display: flex;
      flex-direction: column;
    }

    .result-name {
      font-size: 0.9rem;
      color: var(--text);
    }

    .result-exchange {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .no-results {
      text-align: center;
      padding: var(--space-3);
      color: var(--muted);
    }

    /* Selected Stock */
    .selected-stock {
      margin-bottom: var(--space-4);
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
    }

    .stock-exchange {
      font-size: 0.7rem;
      background: var(--accent);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      vertical-align: middle;
      margin-left: 8px;
    }

    .stock-name {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 8px;
    }

    .stock-details {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-2);
      font-size: 0.8rem;
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
  indices?: IndicesData;
  isRefreshing = false;
  lastUpdated?: Date;

  // Stock search
  searchQuery = '';
  searchResults: SearchResult[] = [];
  selectedStock?: StockQuote;
  isSearching = false;
  private searchSubject = new Subject<string>();

  // Sparkline data
  btcHistory: number[] = [];
  goldHistory: number[] = [];
  silverHistory: number[] = [];

  constructor(
    private marketService: MarketPricesService,
    private stockService: StockService,
    private seo: SeoService,
    private translation: TranslationService
  ) { }

  ngOnInit() {
    this.updateSeo();
    this.fetchPrices();
    this.fetchIndices();
    this.setupSearch();
    this.fetchSparklineData();
  }

  private updateSeo() {
    const title = this.translation.translate('MARKET.SEO_TITLE');
    const desc = this.translation.translate('MARKET.SEO_DESC');
    this.seo.updateMetaTags({
      title: title,
      description: desc
    });
  }

  private setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isSearching = true;
        return this.stockService.searchStocks(query);
      })
    ).subscribe(results => {
      this.searchResults = results;
      this.isSearching = false;
    });
  }

  onSearchChange(query: string) {
    if (query.length >= 2) {
      this.searchSubject.next(query);
    } else {
      this.searchResults = [];
    }
  }

  selectStock(result: SearchResult) {
    this.searchResults = [];
    this.searchQuery = result.symbol;
    this.stockService.getQuote(result.symbol, result.exchange).subscribe(quote => {
      this.selectedStock = quote || undefined;
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

  fetchIndices() {
    this.stockService.getIndices().subscribe({
      next: (data) => {
        this.indices = data;
      },
      error: (err) => {
        console.error('Error fetching indices:', err);
      }
    });
  }

  fetchSparklineData() {
    // Fetch Bitcoin history from CoinGecko
    this.marketService.getBitcoinHistory().subscribe(data => {
      this.btcHistory = data;
    });

    // Generate mock data for Gold and Silver (no free historical API)
    this.goldHistory = this.marketService.generateMockData(2650, 7);
    this.silverHistory = this.marketService.generateMockData(30, 7);
  }

  refreshAll() {
    this.fetchPrices();
    this.fetchIndices();
    if (this.selectedStock) {
      this.stockService.getQuote(this.selectedStock.symbol, this.selectedStock.exchange).subscribe(quote => {
        this.selectedStock = quote || undefined;
      });
    }
  }
}
