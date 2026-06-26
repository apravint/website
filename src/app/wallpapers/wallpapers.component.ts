import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';

interface Wallpaper {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  photographer: string;
  category: string;
}

@Component({
  selector: 'app-wallpapers',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, TranslatePipe],
  templateUrl: './wallpapers.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./wallpapers.component.scss']
})
export class WallpapersComponent implements OnInit {
  private http = inject(HttpClient);
  private seo = inject(SeoService);
  public translationService = inject(TranslationService);
  isNativeShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  // Curated High-Quality Portrait Wallpapers (Direct keyless Unsplash CDN urls, mobile optimized)
  curatedWallpapers: Wallpaper[] = [
    {
      id: 'w1',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
      title: 'Golden Sunset Beach',
      photographer: 'Sean Oulashin',
      category: 'Nature'
    },
    {
      id: 'w2',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&auto=format&fit=crop&q=80',
      title: 'Starry Snowy Mountains',
      photographer: 'Benjamin Voros',
      category: 'Space'
    },
    {
      id: 'w3',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
      title: 'Yosemite Valley Mist',
      photographer: 'Ansel Adams Ref',
      category: 'Nature'
    },
    {
      id: 'w4',
      url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
      title: 'Neon Cyberpunk Alley',
      photographer: 'Aleksandar Pasaric',
      category: 'Cyberpunk'
    },
    {
      id: 'w5',
      url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&auto=format&fit=crop&q=80',
      title: 'Deep Ocean Horizon',
      photographer: 'Dustin Humes',
      category: 'Nature'
    },
    {
      id: 'w6',
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80',
      title: 'Green Forest Peaks',
      photographer: 'Kal Vis',
      category: 'Nature'
    },
    {
      id: 'w7',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
      title: 'Minimal Sand Dunes',
      photographer: 'Lucas Davies',
      category: 'Minimal'
    },
    {
      id: 'w8',
      url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1080&auto=format&fit=crop&q=85',
      thumbnail: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&auto=format&fit=crop&q=80',
      title: 'Purple Cosmic Nebula',
      photographer: 'NASA Hub',
      category: 'Space'
    }
  ];

  // Active view states
  activeCategory = 'All';
  searchQuery = '';
  wallpapersList: Wallpaper[] = [];
  
  // Search API State (Pexels integration)
  pexelsApiKey = '';
  isSearching = false;
  searchError = '';
  showKeyModal = false;

  // Simulator Preview State
  selectedWallpaper: Wallpaper | null = null;
  previewMode: 'lock' | 'home' = 'lock';
  simulatedTime = '09:41';
  simulatedDate = 'Thursday, June 25';

  constructor() {
    this.seo.updateMetaTags({
      title: 'High-Res Mobile Photography Wallpapers | Pravin Tamilan',
      description: 'Search, preview, and download stunning portrait mobile backgrounds with our interactive smartphone preview screen simulator.',
      url: 'https://pravintamilan.com/wallpapers'
    });
  }

  ngOnInit(): void {
    this.wallpapersList = [...this.curatedWallpapers];
    this.selectedWallpaper = this.curatedWallpapers[0]; // Set default preview
    
    // Retrieve stored Pexels API Key
    if (typeof localStorage !== 'undefined') {
      this.pexelsApiKey = localStorage.getItem('pexels-api-key') || '';
    }
    
    this.updateClock();
    setInterval(() => this.updateClock(), 60000); // Update clock every minute
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }

  // Update analog simulated clock
  updateClock(): void {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.simulatedTime = `${hours}:${minutes}`;

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    this.simulatedDate = now.toLocaleDateString('en-US', options);
  }

  // Handle local Category Selection
  selectCategory(category: string): void {
    this.activeCategory = category;
    this.searchQuery = '';
    
    if (category === 'All') {
      this.wallpapersList = [...this.curatedWallpapers];
    } else {
      this.wallpapersList = this.curatedWallpapers.filter(w => w.category === category);
    }
  }

  // Run Search (Loads curated locally if no query, else calls Pexels API if key exists)
  searchWallpapers(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this.selectCategory(this.activeCategory);
      return;
    }

    if (!this.pexelsApiKey) {
      this.showKeyModal = true;
      return;
    }

    this.isSearching = true;
    this.searchError = '';

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&per_page=18`;
    const headers = new HttpHeaders().set('Authorization', this.pexelsApiKey.trim());

    this.http.get<any>(url, { headers }).subscribe({
      next: (response) => {
        if (response && response.photos) {
          this.wallpapersList = response.photos.map((p: any) => {
            return {
              id: p.id.toString(),
              url: p.src.large2x || p.src.original,
              thumbnail: p.src.large || p.src.medium,
              title: p.alt || 'Stock Wallpaper',
              photographer: p.photographer,
              category: 'Search Result'
            };
          });
        } else {
          this.searchError = 'No wallpapers found.';
        }
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error fetching wallpapers from Pexels', err);
        this.searchError = 'Invalid API key or network error. Please check settings.';
        this.isSearching = false;
      }
    });
  }

  // Trigger preview in simulated phone
  setPreviewWallpaper(wallpaper: Wallpaper): void {
    this.selectedWallpaper = wallpaper;
  }

  // Save key locally
  savePexelsKey(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pexels-api-key', this.pexelsApiKey.trim());
    }
    this.showKeyModal = false;
    this.searchWallpapers();
  }

  // Delete key
  clearPexelsKey(): void {
    this.pexelsApiKey = '';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pexels-api-key');
    }
  }

  // Download high-resolution photo in new tab
  downloadWallpaper(wallpaper: Wallpaper): void {
    window.open(wallpaper.url, '_blank');
  }

  // Native share wallpaper link and description
  shareWallpaper(wallpaper: Wallpaper): void {
    if (this.isNativeShareSupported) {
      navigator.share({
        title: wallpaper.title,
        text: `Check out this high quality mobile background: "${wallpaper.title}" by ${wallpaper.photographer}!`,
        url: wallpaper.url
      }).catch(err => console.log('Sharing failed:', err));
    }
  }
}
