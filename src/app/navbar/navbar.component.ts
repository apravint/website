import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

function getPreferredTheme(): 'light' | 'dark' {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
  if (stored === 'light' || stored === 'dark') return stored as 'light' | 'dark';
  // fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function applyTheme(theme: 'light' | 'dark') {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

// initialize immediately
applyTheme(getPreferredTheme());

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  theme: 'light' | 'dark' = 'light';
  menuOpen = false;

  ngOnInit(): void {
    this.theme = getPreferredTheme();
    applyTheme(this.theme);
  }

  toggleTheme() {
    const next: 'light' | 'dark' = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = next;
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
