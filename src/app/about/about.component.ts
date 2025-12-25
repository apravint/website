import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdUnitComponent } from '../shared/ad-unit/ad-unit.component';
import { SeoService } from '../shared/seo.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { SkillBarComponent, Skill } from '../shared/components/skill-bar/skill-bar.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, AdUnitComponent, TranslatePipe, SkillBarComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  skills: Skill[] = [
    { name: 'TypeScript / JavaScript', level: 95, icon: '📜' },
    { name: 'Angular', level: 90, icon: '🅰️' },
    { name: 'React', level: 85, icon: '⚛️' },
    { name: 'Node.js', level: 88, icon: '🟢' },
    { name: 'Python', level: 80, icon: '🐍' },
    { name: 'Java / Spring Boot', level: 75, icon: '☕' },
    { name: 'SQL / NoSQL', level: 85, icon: '🗄️' },
    { name: 'AWS / Cloud', level: 78, icon: '☁️' },
    { name: 'Docker / Kubernetes', level: 72, icon: '🐳' },
    { name: 'Git / CI/CD', level: 90, icon: '🔄' }
  ];

  constructor(private seo: SeoService) { }

  ngOnInit() {
    this.seo.updateMetaTags({
      title: 'About - Tamil Kavithai & Pravin Tamilan',
      description: 'Learn about the mission behind Tamil Kavithai, a curated collection of Tamil poetry and literary works.',
      url: 'https://pravintamilan.com/about'
    });
  }
}
