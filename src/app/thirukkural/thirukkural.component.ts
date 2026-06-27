import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';

interface KuralMeaning {
  ta_mu_va: string;
  ta_salamon: string;
  ta_kalaignar: string;
  en: string;
}

interface Kural {
  chapter: string;
  kural: string[];
  number: number;
  section: string;
  meaning: KuralMeaning;
  
  // UI helper variables
  showMeaning?: boolean;
  activeMeaningTab?: 'mu_va' | 'salamon' | 'kalaignar' | 'en';
}

@Component({
  selector: 'app-thirukkural',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './thirukkural.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./thirukkural.component.scss']
})
export class ThirukkuralComponent implements OnInit {
  private http = inject(HttpClient);
  private seo = inject(SeoService);
  public translationService = inject(TranslationService);

  // Raw and Filtered Kurals
  allKurals: Kural[] = [];
  filteredKurals: Kural[] = [];
  randomKural: Kural | null = null;

  // Search & Filtering
  searchQuery = '';
  selectedSection = 'All';
  selectedChapter = 'All';
  chaptersList: string[] = [];

  // Sections translation map
  sectionsEn: { [key: string]: string } = {
    'அறத்துப்பால்': 'Virtue (Aram)',
    'பொருட்பால்': 'Wealth (Porul)',
    'காமத்துப்பால்': 'Love (Inbam)'
  };

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  isDataLoading = true;
  loadingError = '';

  constructor() {
    this.seo.updateMetaTags({
      title: 'Complete 1330 Thirukkural with Meanings | Pravin Tamilan',
      description: 'Explore the complete 1330 Thirukkural couplets with Tamil commentaries by Mu. Varadarajan, Solomon Pappaiah, M. Karunanidhi, and English translations.',
      url: 'https://pravintamilan.com/thirukkural'
    });
  }

  ngOnInit(): void {
    this.loadThirukkuralData();
    
    // Synchronize default meaning tabs when user switches language
    this.translationService.currentLang$.subscribe(lang => {
      const defaultTab = lang === 'ta' ? 'mu_va' : 'en';
      if (this.randomKural) {
        this.randomKural.activeMeaningTab = defaultTab;
      }
      this.allKurals.forEach(k => {
        k.activeMeaningTab = defaultTab;
      });
    });
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }

  // Load local JSON asset
  loadThirukkuralData(): void {
    this.isDataLoading = true;
    this.loadingError = '';
    
    this.http.get<any>('assets/thirukkural.json').subscribe({
      next: (data) => {
        if (data && data.kurals) {
          this.allKurals = data.kurals.map((k: any) => {
            return {
              ...k,
              showMeaning: false,
              activeMeaningTab: this.getCurrentLanguage() === 'ta' ? 'mu_va' : 'en'
            };
          });
          
          this.filteredKurals = [...this.allKurals];
          this.isDataLoading = false;
          
          this.extractChapters();
          this.updateTotalPages();
          this.generateRandomKural();
        } else {
          this.loadingError = 'Unable to parse Thirukkural database.';
          this.isDataLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading Thirukkural JSON', err);
        this.loadingError = 'Failed to load Thirukkural dataset. Please check your internet connection.';
        this.isDataLoading = false;
      }
    });
  }

  // Extract chapters dynamically based on active filter section
  extractChapters(): void {
    const chapters = new Set<string>();
    this.allKurals.forEach(k => {
      if (this.selectedSection === 'All' || k.section === this.selectedSection) {
        chapters.add(k.chapter);
      }
    });
    this.chaptersList = Array.from(chapters);
  }

  // Calculate pages
  updateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredKurals.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Handle Search and Dropdown Filter changes
  applyFilters(): void {
    this.currentPage = 1;
    
    this.filteredKurals = this.allKurals.filter(k => {
      // 1. Section filter
      if (this.selectedSection !== 'All' && k.section !== this.selectedSection) {
        return false;
      }
      
      // 2. Chapter filter
      if (this.selectedChapter !== 'All' && k.chapter !== this.selectedChapter) {
        return false;
      }
      
      // 3. Search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        const numQuery = parseInt(query, 10);
        
        // Exact number search
        if (!isNaN(numQuery) && k.number === numQuery) {
          return true;
        }
        
        // Text searches
        const textMatch = k.kural[0].toLowerCase().includes(query) || 
                          k.kural[1].toLowerCase().includes(query) ||
                          k.chapter.toLowerCase().includes(query) ||
                          k.section.toLowerCase().includes(query);
                          
        const meaningMatch = k.meaning.ta_mu_va.toLowerCase().includes(query) ||
                             k.meaning.ta_salamon.toLowerCase().includes(query) ||
                             k.meaning.ta_kalaignar.toLowerCase().includes(query) ||
                             k.meaning.en.toLowerCase().includes(query);
                             
        return textMatch || meaningMatch;
      }
      
      return true;
    });

    this.updateTotalPages();
  }

  // Triggered on section selector change
  onSectionChange(): void {
    this.selectedChapter = 'All';
    this.extractChapters();
    this.applyFilters();
  }

  // Generate Kural of the Day
  generateRandomKural(): void {
    if (this.allKurals.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.allKurals.length);
      this.randomKural = {
        ...this.allKurals[randomIndex],
        showMeaning: true,
        activeMeaningTab: this.getCurrentLanguage() === 'ta' ? 'mu_va' : 'en'
      };
    }
  }

  // Get sliced list for active page
  getPaginatedKurals(): Kural[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredKurals.slice(startIndex, startIndex + this.pageSize);
  }

  // Pagination Actions
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    if (typeof document !== 'undefined') {
      const element = document.querySelector('.filters-panel');
      if (element) {
        const yOffset = -90; // Account for floating navbar height
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  // Toggle detail visibility
  toggleKuralMeaning(kural: Kural): void {
    kural.showMeaning = !kural.showMeaning;
  }

  // Change tabs inside card
  setMeaningTab(kural: Kural, tab: 'mu_va' | 'salamon' | 'kalaignar' | 'en'): void {
    kural.activeMeaningTab = tab;
  }
}
