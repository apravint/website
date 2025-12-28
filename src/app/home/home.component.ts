import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { GitHubService, GitHubStats } from '../shared/services/github.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, AdUnitComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private githubService = inject(GitHubService);

  today = new Date().toDateString();
  showGreeting = true;

  // GitHub Stats
  githubUsername = 'apravint'; // Your GitHub username
  githubStats: GitHubStats | null = null;
  totalStars = 0;
  loadingGitHub = true;

  constructor(private seo: SeoService) {
    this.seo.updateMetaTags({
      title: 'Pravin Tamilan - Full Stack Engineer & Poet',
      description: 'Portfolio of Pravin Tamilan, a Full Stack Engineer building digital experiences. Explore my projects, poetry, and technical articles.',
      image: 'assets/profile-pic.jpg',
      url: 'https://pravintamilan.com/'
    });
  }

  ngOnInit(): void {
    // hide the greeting after 5 seconds
    setTimeout(() => (this.showGreeting = false), 4000);

    // Fetch GitHub stats
    this.fetchGitHubStats();
  }

  private fetchGitHubStats(): void {
    this.githubService.getUserStats(this.githubUsername).subscribe(stats => {
      this.githubStats = stats;
      this.loadingGitHub = false;
    });

    this.githubService.getTotalStars(this.githubUsername).subscribe(stars => {
      this.totalStars = stars;
    });
  }
}
