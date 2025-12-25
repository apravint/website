import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../shared/translation.service';
import { TranslatePipe } from '../shared/translate.pipe';

function getPreferredTheme(): 'light' | 'dark' {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  if (stored === 'light' || stored === 'dark') return stored as 'light' | 'dark';
  // fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function getPreferredColor(): string {
  return (typeof localStorage !== 'undefined' ? localStorage.getItem('color-theme') : null) || 'indigo';
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

export function applyColor(color: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-color', color);
  }
}

// initialize immediately
applyTheme(getPreferredTheme());
applyColor(getPreferredColor());

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';
  colorTheme: string = 'indigo';
  menuOpen = false;
  showColorPicker = false;
  currentLang = 'en';

  colors = [
    { name: 'indigo', value: '#4f46e5' },
    { name: 'emerald', value: '#059669' },
    { name: 'rose', value: '#e11d48' },
    { name: 'amber', value: '#d97706' },
    { name: 'sky', value: '#0284c7' }
  ];

  constructor(private translationService: TranslationService) { }

  ngOnInit(): void {
    this.theme = getPreferredTheme();
    this.colorTheme = getPreferredColor();
    applyTheme(this.theme);
    applyColor(this.colorTheme);

    this.translationService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });
  }

  toggleLanguage() {
    const next = this.currentLang === 'en' ? 'ta' : 'en';
    this.translationService.setLanguage(next);
  }

  toggleTheme() {
    const next: 'light' | 'dark' = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = next;
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
  }

  setColorTheme(color: string) {
    this.colorTheme = color;
    applyColor(color);
    try { localStorage.setItem('color-theme', color); } catch { /* ignore */ }
    this.showColorPicker = false;
  }

  toggleColorPicker() {
    this.showColorPicker = !this.showColorPicker;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
    this.showColorPicker = false;
  }
}
