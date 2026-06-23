import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, TranslatePipe, AdUnitComponent],
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
        <!-- Market Scrolling Ticker -->
        <div class="market-ticker-wrap">
          <div class="ticker-header">
            <span>📊 Markets</span>
          </div>
          <div class="ticker-scroll-container">
            <div class="ticker-track" *ngIf="indices?.nifty50 || marketPrices?.bitcoin; else loadingTicker">
              <!-- Double elements for seamless looping -->
              <div class="ticker-items">
                <ng-container *ngTemplateOutlet="tickerItemsTemplate"></ng-container>
              </div>
              <div class="ticker-items" aria-hidden="true">
                <ng-container *ngTemplateOutlet="tickerItemsTemplate"></ng-container>
              </div>
            </div>
            <ng-template #loadingTicker>
              <div class="ticker-loading muted">Fetching latest market data...</div>
            </ng-template>
          </div>
        </div>

        <ng-template #tickerItemsTemplate>
          <!-- Nifty 50 -->
          <div class="ticker-item index-item" *ngIf="indices?.nifty50">
            <span class="ticker-label">NIFTY 50</span>
            <span class="ticker-value">₹{{ indices!.nifty50!.price | number:'1.0-0' }}</span>
            <span class="ticker-change" [class.up]="indices!.nifty50!.isUp" [class.down]="!indices!.nifty50!.isUp">
              {{ indices!.nifty50!.isUp ? '▲' : '▼' }}{{ indices!.nifty50!.percentChange | number:'1.2-2' }}%
            </span>
          </div>
          <!-- Sensex -->
          <div class="ticker-item index-item" *ngIf="indices?.sensex">
            <span class="ticker-label">SENSEX</span>
            <span class="ticker-value">₹{{ indices!.sensex!.price | number:'1.0-0' }}</span>
            <span class="ticker-change" [class.up]="indices!.sensex!.isUp" [class.down]="!indices!.sensex!.isUp">
              {{ indices!.sensex!.isUp ? '▲' : '▼' }}{{ indices!.sensex!.percentChange | number:'1.2-2' }}%
            </span>
          </div>
          <!-- Bitcoin -->
          <div class="ticker-item" *ngIf="marketPrices?.bitcoin">
            <span class="ticker-icon">₿</span>
            <span class="ticker-label">Bitcoin</span>
            <span class="ticker-value">{{ marketPrices!.bitcoin | currency:'USD':'symbol':'1.0-0' }}</span>
          </div>
          <!-- Gold -->
          <div class="ticker-item" *ngIf="marketPrices?.gold">
            <span class="ticker-icon">📀</span>
            <span class="ticker-label">Gold (oz)</span>
            <span class="ticker-value">{{ marketPrices!.gold | currency:'USD':'symbol':'1.0-2' }}</span>
          </div>
          <!-- Silver -->
          <div class="ticker-item" *ngIf="marketPrices?.silver">
            <span class="ticker-icon">⚪</span>
            <span class="ticker-label">Silver</span>
            <span class="ticker-value">{{ marketPrices!.silver | currency:'USD':'symbol':'1.2-2' }}</span>
          </div>
        </ng-template>

        <!-- Search and View Toggle controls -->
        <div class="controls-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   placeholder="Search articles by title or content..."
                   class="search-input">
          </div>
          <div class="view-toggle">
            <button class="toggle-btn" 
                    [class.active]="!showBookmarksOnly" 
                    (click)="showBookmarksOnly = false">
              All Stories
            </button>
            <button class="toggle-btn" 
                    [class.active]="showBookmarksOnly" 
                    (click)="showBookmarksOnly = true">
              Bookmarks ({{ bookmarkedArticles.length }})
            </button>
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs" *ngIf="!showBookmarksOnly">
          <button *ngFor="let cat of categories" 
                  class="tab-btn" 
                  [class.active]="selectedCategory === cat.id"
                  (click)="selectCategory(cat.id)">
            {{ cat.label }}
          </button>
        </div>

        <!-- Displaying Bookmarked Empty State -->
        <div class="empty-state centered" *ngIf="showBookmarksOnly && bookmarkedArticles.length === 0">
          <span class="empty-icon">⭐</span>
          <h3>No bookmarked stories yet</h3>
          <p class="muted">Click the star icon on any news story to save it for later.</p>
        </div>

        <!-- Displaying Search Empty State -->
        <div class="empty-state centered" *ngIf="displayArticles.length === 0 && !isLoading && (searchQuery || showBookmarksOnly && bookmarkedArticles.length > 0)">
          <span class="empty-icon">📭</span>
          <h3>No matching articles found</h3>
          <p class="muted">Try searching for other keywords.</p>
        </div>

        <!-- Featured/Hero Article (Top story) -->
        <div class="featured-section animate-fade-in" *ngIf="displayArticles.length > 0 && !isLoading">
          <div class="hero-card">
            <div class="hero-image" *ngIf="displayArticles[0].image_url">
              <img [src]="displayArticles[0].image_url" [alt]="displayArticles[0].title" loading="lazy">
            </div>
            <div class="hero-content">
              <div class="hero-meta">
                <span class="news-source text-gradient">{{ displayArticles[0].source_id }}</span>
                <button class="bookmark-btn" 
                        [class.active]="isBookmarked(displayArticles[0])" 
                        (click)="toggleBookmark($event, displayArticles[0])"
                        title="Bookmark Story">
                  ★
                </button>
              </div>
              <a [href]="displayArticles[0].link" target="_blank" rel="noopener noreferrer" class="hero-link">
                <h2 class="hero-title">{{ displayArticles[0].title }}</h2>
                <p class="hero-desc muted" *ngIf="displayArticles[0].description">
                  {{ displayArticles[0].description }}
                </p>
              </a>
            </div>
          </div>
        </div>

        <!-- News Grid (Remaining articles) -->
        <div class="news-grid" *ngIf="displayArticles.length > 1; else loadingState">
          <div *ngFor="let article of displayArticles | slice:1; let i = index" 
               class="card news-card hover-effect">
            
            <button class="bookmark-btn card-bookmark" 
                    [class.active]="isBookmarked(article)" 
                    (click)="toggleBookmark($event, article)"
                    title="Bookmark Story">
              ★
            </button>
            
            <a [href]="article.link" 
               target="_blank" 
               rel="noopener noreferrer"
               class="news-card-link">
              <div class="news-image" *ngIf="article.image_url">
                <img [src]="article.image_url" [alt]="article.title" loading="lazy">
              </div>
              <div class="news-content">
                <span class="news-source muted">{{ article.source_id }}</span>
                <h3 class="news-title">{{ article.title }}</h3>
                <p class="news-desc muted" *ngIf="article.description">
                  {{ article.description | slice:0:100 }}{{ article.description.length > 100 ? '...' : '' }}
                </p>
              </div>
            </a>
          </div>

          <!-- Mid Ad after 4 articles in standard view -->
          <div class="card centered ad-card full-width" *ngIf="displayArticles.length > 4">
            <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
            <app-ad-unit adSlot="1234567890"></app-ad-unit>
          </div>
        </div>

        <ng-template #loadingState>
          <div class="loading-state centered" *ngIf="isLoading">
            <div class="spinner"></div>
            <p class="muted">{{ 'NEWS.LOADING' | translate }}</p>
          </div>
        </ng-template>

        <!-- Bottom Ad - only show when content is available -->
        <div class="card centered ad-card" *ngIf="displayArticles.length > 0">
          <small class="muted">{{ 'COMMON.SPONSORED' | translate }}</small>
          <app-ad-unit adSlot="1234567890"></app-ad-unit>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .controls-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: var(--space-2);
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border-radius: 30px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;

      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
      }
    }

    .view-toggle {
      display: flex;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px;
      border-radius: 30px;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      color: var(--text);
      padding: 8px 16px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;

      &.active {
        background: var(--accent);
        color: #fff;
      }
    }

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
      padding: 8px 18px;
      border-radius: 25px;
      font-weight: 500;
      cursor: pointer;
      font-size: 0.9rem;
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

    /* Featured/Hero Article styles */
    .hero-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      margin-bottom: var(--space-4);
      box-shadow: 0 10px 30px -15px rgba(0,0,0,0.3);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .hero-image {
      height: 380px;
      overflow: hidden;
      background: var(--border);

      @media (max-width: 768px) {
        height: 220px;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .hero-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .hero-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-2);
    }

    .hero-link {
      text-decoration: none;
      color: inherit;
    }

    .hero-title {
      font-size: 1.8rem;
      font-weight: 700;
      line-height: 1.3;
      margin: 0 0 var(--space-2);
      color: var(--text);

      &:hover {
        color: var(--accent);
      }
    }

    .hero-desc {
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
    }

    /* Bookmarking elements */
    .bookmark-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      font-size: 1.4rem;
      cursor: pointer;
      line-height: 1;
      padding: 4px;
      transition: all 0.2s;

      &:hover {
        transform: scale(1.15);
        color: #eab308;
      }

      &.active {
        color: #eab308;
      }
    }

    .card-bookmark {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      z-index: 10;
      background: rgba(var(--surface-rgb), 0.7);
      backdrop-filter: blur(4px);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
    }

    /* Standard Grid styles */
    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--space-3);
      margin: var(--space-3) 0;
    }

    .news-card {
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 0;
    }

    .news-card-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      height: 100%;
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
      display: flex;
      flex-direction: column;
      flex: 1;
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

    .loading-state, .empty-state {
      padding: var(--space-4) 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: var(--space-2);
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

    /* Market Ticker Marquee Layout */
    .market-ticker-wrap {
      display: flex;
      align-items: stretch;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: var(--space-4);
      height: 48px;
    }

    .ticker-header {
      background: var(--accent);
      color: #fff;
      display: flex;
      align-items: center;
      padding: 0 16px;
      font-weight: 600;
      font-size: 0.9rem;
      z-index: 10;
      white-space: nowrap;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }

    .ticker-scroll-container {
      flex: 1;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
    }

    .ticker-track {
      display: flex;
      width: max-content;
      animation: marquee 35s linear infinite;
      align-items: center;
      
      &:hover {
        animation-play-state: paused;
      }
    }

    .ticker-items {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding-right: var(--space-4);
    }

    .ticker-item {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .ticker-label {
      font-weight: 600;
      color: var(--muted);
      font-size: 0.8rem;
    }

    .ticker-value {
      font-weight: 700;
      color: var(--text);
    }

    .ticker-change {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 1px 5px;
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

    .ticker-loading {
      padding-left: 20px;
      font-size: 0.85rem;
    }

    @keyframes marquee {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-50%, 0, 0); }
    }
  `]
})
export class NewsComponent implements OnInit {
  articles: NewsArticle[] = [];
  bookmarkedArticles: NewsArticle[] = [];
  selectedCategory = 'top';
  isLoading = true;
  marketPrices: MarketData | null = null;
  indices: IndicesData | null = null;
  
  searchQuery = '';
  showBookmarksOnly = false;

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
    this.loadBookmarks();
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

  // Bookmarking functionality
  private loadBookmarks() {
    try {
      const saved = localStorage.getItem('news_bookmarks');
      if (saved) {
        this.bookmarkedArticles = jsonParseSafe(saved, []);
      }
    } catch (e) {
      this.bookmarkedArticles = [];
    }
  }

  isBookmarked(article: NewsArticle): boolean {
    return this.bookmarkedArticles.some(a => a.link === article.link);
  }

  toggleBookmark(event: Event, article: NewsArticle) {
    event.stopPropagation();
    event.preventDefault();
    if (this.isBookmarked(article)) {
      this.bookmarkedArticles = this.bookmarkedArticles.filter(a => a.link !== article.link);
    } else {
      this.bookmarkedArticles.push(article);
    }
    localStorage.setItem('news_bookmarks', JSON.stringify(this.bookmarkedArticles));
  }

  // Filtered view logic
  get displayArticles(): NewsArticle[] {
    const sourceList = this.showBookmarksOnly ? this.bookmarkedArticles : this.articles;
    if (!this.searchQuery) {
      return sourceList;
    }
    const query = this.searchQuery.toLowerCase();
    return sourceList.filter(a => 
      a.title.toLowerCase().includes(query) || 
      (a.description && a.description.toLowerCase().includes(query)) ||
      a.source_id.toLowerCase().includes(query)
    );
  }
}

// Simple safe JSON parser helper
function jsonParseSafe(str: string, fallback: any): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}
