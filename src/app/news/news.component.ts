import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsArticle } from '../shared/services/news.service';
import { MarketPricesService, MarketData } from '../shared/services/market-prices.service';
import { StockService, IndicesData } from '../shared/services/stock.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslatePipe, AdUnitComponent],
  template: `
    <section class="animate-fade-in">
      <div class="page-hero">
        <div class="bg-glow"></div>
        <div class="container">
          <h1><span class="text-gradient">{{ 'NEWS.TITLE' | translate }} 📰</span></h1>
          <p class="lead">{{ 'NEWS.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <div class="container">
        <!-- Market Ticker Section -->
        <div class="market-ticker">
          <h3 class="ticker-title">📈 Market Snapshot</h3>
          <div class="ticker-grid">
            <!-- Indian Indices -->
            <div class="ticker-item index-item" *ngIf="indices?.nifty50">
              <span class="ticker-icon">📊</span>
              <span class="ticker-label">NIFTY 50</span>
              <span class="ticker-value">₹{{ indices!.nifty50!.price | number:'1.0-0' }}</span>
              <span class="ticker-change" [class.up]="indices!.nifty50!.isUp" [class.down]="!indices!.nifty50!.isUp">
                {{ indices!.nifty50!.isUp ? '▲' : '▼' }}{{ indices!.nifty50!.percentChange | number:'1.2-2' }}%
              </span>
            </div>
            <div class="ticker-item index-item" *ngIf="indices?.sensex">
              <span class="ticker-icon">📈</span>
              <span class="ticker-label">SENSEX</span>
              <span class="ticker-value">₹{{ indices!.sensex!.price | number:'1.0-0' }}</span>
              <span class="ticker-change" [class.up]="indices!.sensex!.isUp" [class.down]="!indices!.sensex!.isUp">
                {{ indices!.sensex!.isUp ? '▲' : '▼' }}{{ indices!.sensex!.percentChange | number:'1.2-2' }}%
              </span>
            </div>
            <!-- Crypto & Commodities -->
            <div class="ticker-item" *ngIf="marketPrices?.bitcoin">
              <span class="ticker-icon">₿</span>
              <span class="ticker-label">Bitcoin</span>
              <span class="ticker-value">{{ marketPrices!.bitcoin | currency:'USD':'symbol':'1.0-0' }}</span>
            </div>
            <div class="ticker-item" *ngIf="marketPrices?.gold">
              <span class="ticker-icon">📀</span>
              <span class="ticker-label">Gold</span>
              <span class="ticker-value">{{ marketPrices!.gold | currency:'USD':'symbol':'1.0-2' }}</span>
            </div>
            <div class="ticker-item" *ngIf="marketPrices?.silver">
              <span class="ticker-icon">⚪</span>
              <span class="ticker-label">Silver</span>
              <span class="ticker-value">{{ marketPrices!.silver | currency:'USD':'symbol':'1.2-2' }}</span>
            </div>
          </div>
          <p class="ticker-note muted" *ngIf="!marketPrices?.gold && !indices?.nifty50">Loading market data...</p>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
          <button *ngFor="let cat of categories" 
                  class="tab-btn" 
                  [class.active]="selectedCategory === cat.id"
                  (click)="selectCategory(cat.id)">
            {{ cat.label }}
          </button>
        </div>

        <!-- Top Ad -->
        <div class="card centered ad-card">
          <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
          <app-ad-unit adSlot="1234567890"></app-ad-unit>
        </div>

        <!-- News Grid -->
        <div class="news-grid" *ngIf="articles.length > 0; else loading">
          <a *ngFor="let article of articles; let i = index" 
             [href]="article.link" 
             target="_blank" 
             rel="noopener noreferrer"
             class="card news-card hover-effect">
            <div class="news-image" *ngIf="article.image_url">
              <img [src]="article.image_url" [alt]="article.title" loading="lazy">
            </div>
            <div class="news-content">
              <span class="news-source muted">{{ article.source_id }}</span>
              <h3 class="news-title">{{ article.title }}</h3>
              <p class="news-desc muted" *ngIf="article.description">
                {{ article.description | slice:0:120 }}{{ article.description.length > 120 ? '...' : '' }}
              </p>
            </div>
          </a>

          <!-- Mid Ad after 4 articles -->
          <div class="card centered ad-card full-width" *ngIf="articles.length > 4">
            <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
            <app-ad-unit adSlot="1234567890"></app-ad-unit>
          </div>
        </div>

        <ng-template #loading>
          <div class="loading-state centered">
            <div class="spinner"></div>
            <p class="muted">{{ 'NEWS.LOADING' | translate }}</p>
          </div>
        </ng-template>

        <!-- Bottom Ad -->
        <div class="card centered ad-card">
          <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
          <app-ad-unit adSlot="1234567890"></app-ad-unit>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .category-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: center;
      margin-bottom: var(--space-3);
    }

    .tab-btn {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }

      &.active {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--space-3);
      margin: var(--space-3) 0;
    }

    .news-card {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      overflow: hidden;
      padding: 0;
    }

    .news-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background: var(--border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s;
      }
    }

    .news-card:hover .news-image img {
      transform: scale(1.05);
    }

    .news-content {
      padding: var(--space-3);
    }

    .news-source {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .news-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: var(--space-1) 0;
      line-height: 1.4;
      color: var(--text);
    }

    .news-desc {
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    .ad-card {
      margin: var(--space-3) 0;
    }

    .full-width {
      grid-column: 1 / -1;
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

    .text-gradient {
      background: linear-gradient(to right, var(--accent), #d946ef);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Market Ticker Styles */
    .market-ticker {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .ticker-title {
      text-align: center;
      margin: 0 0 var(--space-2);
      font-size: 1.1rem;
      font-weight: 600;
    }

    .ticker-grid {
      display: flex;
      justify-content: center;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .ticker-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--surface);
      border-radius: 50px;
      border: 1px solid var(--border);
    }

    .ticker-icon {
      font-size: 1.2rem;
    }

    .ticker-label {
      font-weight: 500;
      color: var(--muted);
      font-size: 0.85rem;
    }

    .ticker-value {
      font-weight: 700;
      color: var(--accent);
      font-size: 1rem;
    }

    .ticker-change {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .ticker-change.up {
      color: #22c55e;
      background: rgba(34, 197, 94, 0.1);
    }

    .ticker-change.down {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .ticker-note {
      text-align: center;
      font-size: 0.85rem;
      margin-top: var(--space-2);
    }

    .index-item {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%);
    }
  `]
})
export class NewsComponent implements OnInit {
  articles: NewsArticle[] = [];
  selectedCategory = 'top';
  isLoading = true;
  marketPrices: MarketData | null = null;
  indices: IndicesData | null = null;

  categories = [
    { id: 'top', label: 'Top Stories' },
    { id: 'business', label: 'Business' },
    { id: 'technology', label: 'Tech' },
    { id: 'sports', label: 'Sports' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'world', label: 'World' }
  ];

  constructor(
    private newsService: NewsService,
    private marketService: MarketPricesService,
    private stockService: StockService,
    private seo: SeoService,
    private translation: TranslationService
  ) { }

  ngOnInit() {
    this.updateSeo();
    this.loadNews();
    this.loadMarketPrices();
    this.loadIndices();
  }

  private updateSeo() {
    const title = this.translation.translate('NEWS.SEO_TITLE');
    const desc = this.translation.translate('NEWS.SEO_DESC');
    this.seo.updateMetaTags({ title, description: desc });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.loadNews();
  }

  private loadNews() {
    this.isLoading = true;
    this.articles = [];
    this.newsService.getNews(this.selectedCategory).subscribe(articles => {
      this.articles = articles;
      this.isLoading = false;
    });
  }

  private loadMarketPrices() {
    this.marketService.getMarketPrices().subscribe(prices => {
      this.marketPrices = prices;
    });
  }

  private loadIndices() {
    this.stockService.getIndices().subscribe(indices => {
      this.indices = indices;
    });
  }
}
