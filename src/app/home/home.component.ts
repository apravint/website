import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../shared/seo.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { GitHubService, GitHubStats } from '../shared/services/github.service';
import { KavithaiService, Kavithai } from '../kavithai/kavithai.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface Project {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  icon: string;
}

interface Skill {
  name: string;
  percentage: number;
  level: string;
  category: 'frontend' | 'backend' | 'devops' | 'creative';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private githubService = inject(GitHubService);
  private kavithaiService = inject(KavithaiService);

  today = new Date().toDateString();
  showGreeting = true;

  // GitHub Stats
  githubUsername = 'apravint';
  githubStats: GitHubStats | null = null;
  totalStars = 0;
  loadingGitHub = true;

  // Poem Preview
  featuredPoem: Kavithai | null = null;
  allPoems: Kavithai[] = [];
  loadingPoem = true;

  // Projects
  featuredProjects: Project[] = [
    {
      title: 'Tamil Kavithai Mobile App',
      description: 'An elegant, offline-first Android application designed for Tamil poetry lovers to discover, read, and share classical and modern poems.',
      tags: ['Angular', 'Capacitor', 'Ionic', 'SQLite', 'Firebase'],
      githubUrl: 'https://github.com/apravint/website',
      icon: '📱'
    },
    {
      title: 'Termux Agentic AI Environment',
      description: 'A custom, specialized developer sandbox tailored for Termux to prototype, run, and benchmark agentic AI agents on mobile environments.',
      tags: ['TypeScript', 'Node.js', 'Bash', 'Gemini AI'],
      githubUrl: 'https://github.com/apravint',
      icon: '🤖'
    },
    {
      title: 'IPTV M3U Playlist Parser & Parser',
      description: 'High-speed, offline-supported streams organizer and validator that extracts, filters, and formats live IPTV channels by region and category.',
      tags: ['TypeScript', 'Web Workers', 'RxJS', 'HTML5'],
      githubUrl: 'https://github.com/apravint',
      icon: '📺'
    }
  ];

  // Technical Skills
  skills: Skill[] = [
    { name: 'Angular / TypeScript', percentage: 95, level: 'Expert', category: 'frontend' },
    { name: 'Node.js / Express', percentage: 90, level: 'Expert', category: 'backend' },
    { name: 'Python / FastAPI', percentage: 85, level: 'Advanced', category: 'backend' },
    { name: 'Firebase & Firestore', percentage: 90, level: 'Expert', category: 'devops' },
    { name: 'Generative AI (Gemini SDK)', percentage: 85, level: 'Advanced', category: 'creative' },
    { name: 'Docker & GitHub Actions', percentage: 80, level: 'Advanced', category: 'devops' }
  ];

  selectedSkillCategory: 'all' | 'frontend' | 'backend' | 'devops' = 'all';

  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'Pravin Tamilan - Full Stack Engineer & Poet',
      description: 'Portfolio of Pravin Tamilan, a Full Stack Engineer building digital experiences. Explore my projects, poetry, and technical articles.',
      image: 'assets/profile-pic.jpg',
      url: 'https://pravintamilan.com/'
    });
  }

  ngOnInit(): void {
    setTimeout(() => (this.showGreeting = false), 4000);
    this.fetchGitHubStats();
    this.fetchFeaturedPoem();
  }

  private fetchGitHubStats(): void {
    this.githubService.getUserStats(this.githubUsername).pipe(
      catchError(err => {
        console.error('Error fetching github stats', err);
        this.loadingGitHub = false;
        return of(null);
      })
    ).subscribe(stats => {
      this.githubStats = stats;
      this.loadingGitHub = false;
    });

    this.githubService.getTotalStars(this.githubUsername).pipe(
      catchError(() => of(0))
    ).subscribe(stars => {
      this.totalStars = stars;
    });
  }

  private fetchFeaturedPoem(): void {
    this.loadingPoem = true;
    this.kavithaiService.getKavithaigal().pipe(
      catchError(err => {
        console.error('Error fetching poems for home', err);
        this.loadingPoem = false;
        return of([]);
      })
    ).subscribe(poems => {
      this.allPoems = poems;
      this.loadingPoem = false;
      this.pickRandomPoem();
    });
  }

  pickRandomPoem(): void {
    if (this.allPoems && this.allPoems.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.allPoems.length);
      this.featuredPoem = this.allPoems[randomIndex];
    }
  }

  filterSkills(category: 'all' | 'frontend' | 'backend' | 'devops'): Skill[] {
    if (category === 'all') return this.skills;
    return this.skills.filter(s => s.category === category);
  }

  changeSkillCategory(category: 'all' | 'frontend' | 'backend' | 'devops'): void {
    this.selectedSkillCategory = category;
  }
}
