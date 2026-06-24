import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../shared/seo.service';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-tutorials',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './tutorials.component.html',
  styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {
  private seo = inject(SeoService);
  public translationService = inject(TranslationService);

  constructor() {
    this.seo.updateMetaTags({
      title: 'Termux + Antigravity Dev Tutorial | Pravin Tamilan',
      description: 'Learn how to set up a professional Angular development environment on Android using Termux and pair program with Google Antigravity AI.',
      url: 'https://pravintamilan.com/tutorials'
    });
  }

  ngOnInit(): void {}

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLang();
  }
}
