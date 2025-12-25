import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService, NewsArticle } from '../shared/services/news.service';
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
  `]
})
export class NewsComponent implements OnInit {
    articles: NewsArticle[] = [];
    selectedCategory = 'top';
    isLoading = true;

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
        private seo: SeoService,
        private translation: TranslationService
    ) { }

    ngOnInit() {
        this.updateSeo();
        this.loadNews();
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
}
