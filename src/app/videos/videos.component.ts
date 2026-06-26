import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';

interface VideoItem {
  id: string; // YouTube Video ID
  title: string;
  category: 'Coding' | 'Poetry' | 'Guides';
  description: string;
  duration: string;
}

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, TranslatePipe],
  templateUrl: './videos.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./videos.component.scss']
})
export class VideosComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private seo = inject(SeoService);
  public translationService = inject(TranslationService);

  // Categories list
  categories = ['All', 'Coding', 'Poetry', 'Guides'];
  activeCategory = 'All';
  searchQuery = '';

  // Initial YouTube Videos (Users can swap ID values with their actual video IDs)
  videos: VideoItem[] = [
    {
      id: 'dQw4w9WgXcQ', // Rick Astley - placeholder. User can replace this ID.
      title: 'Termux Android Development Environment Setup Guide',
      category: 'Guides',
      description: 'Step-by-step setup guide for Node.js, Git, and Angular CLI on Android via Termux.',
      duration: '12:45'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'Tamil Kavithai: Poetry Recital & AI Assistant Demo',
      category: 'Poetry',
      description: 'Listen to Tamil poetry readings and explore the generative AI poetry engine built with Gemini API.',
      duration: '08:30'
    },
    {
      id: 'dQw4w9WgXcQ',
      title: 'GitHub deployment & Git Workflow on Mobile Terminals',
      category: 'Coding',
      description: 'Master git branch management, deployments, and CI/CD pipelines straight from your smartphone.',
      duration: '15:20'
    }
  ];

  filteredVideos: VideoItem[] = [];

  // Search API State
  youtubeApiKey = '';
  isSearching = false;
  searchError = '';
  showKeyModal = false;

  // Cinema Lightbox Modal Player State
  selectedVideo: VideoItem | null = null;
  safeVideoUrl: SafeResourceUrl | null = null;

  constructor() {
    this.seo.updateMetaTags({
      title: 'YouTube Video Gallery | Pravin Tamilan',
      description: 'Watch video tutorials, Tamil poetry readings, and project walkthroughs direct from mobile development logs.',
      url: 'https://pravintamilan.com/videos'
    });
  }

  ngOnInit(): void {
    this.filteredVideos = [...this.videos];
    
    // Retrieve stored YouTube API Key
    if (typeof localStorage !== 'undefined') {
      this.youtubeApiKey = localStorage.getItem('youtube-api-key') || '';
    }
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }

  // Generate YouTube Thumbnail CDN URL
  getThumbnailUrl(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  // Filter list based on search and category choice
  filterVideos(): void {
    this.filteredVideos = this.videos.filter(v => {
      // Category filter
      const categoryMatch = this.activeCategory === 'All' || v.category === this.activeCategory;

      // Text search
      const query = this.searchQuery.toLowerCase().trim();
      const textMatch = !query || 
                        v.title.toLowerCase().includes(query) || 
                        v.description.toLowerCase().includes(query) || 
                        v.category.toLowerCase().includes(query);

      return categoryMatch && textMatch;
    });
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.filterVideos();
  }

  // Cinema Lightbox modal open
  playVideo(video: VideoItem): void {
    this.selectedVideo = video;
    // Set auto-play to 1 so video starts immediately upon clicking the card thumbnail
    const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  // Cinema Lightbox modal close
  closePlayer(): void {
    this.selectedVideo = null;
    this.safeVideoUrl = null;
  }

  // YouTube API Search
  searchVideos(): void {
    const query = this.searchQuery.trim();
    if (!query) {
      this.filterVideos();
      return;
    }

    if (!this.youtubeApiKey) {
      this.showKeyModal = true;
      return;
    }

    this.isSearching = true;
    this.searchError = '';

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(query)}&type=video&key=${this.youtubeApiKey}`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response && response.items) {
          this.filteredVideos = response.items.map((item: any) => {
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              category: 'Coding', // Default category
              description: item.snippet.description || '',
              duration: 'HD' // Fallback duration
            };
          });
          if (this.filteredVideos.length === 0) {
            this.searchError = 'No videos found.';
          }
        } else {
          this.searchError = 'No videos found.';
        }
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error fetching videos from YouTube', err);
        this.searchError = 'Invalid API key or network error. Please check settings.';
        this.isSearching = false;
      }
    });
  }

  saveYoutubeKey(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('youtube-api-key', this.youtubeApiKey.trim());
    }
    this.showKeyModal = false;
    this.searchVideos();
  }

  clearYoutubeKey(): void {
    this.youtubeApiKey = '';
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('youtube-api-key');
    }
  }
}
