import { Injectable, signal, computed } from '@angular/core';

export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  
  // Signal for theme state
  private _themeSignal = signal<Theme>(this.getInitialTheme());
  
  // Computed values
  readonly theme = this._themeSignal.asReadonly();
  readonly isDarkTheme = computed(() => this.theme() === Theme.Dark);
  readonly isLightTheme = computed(() => this.theme() === Theme.Light);

  constructor() {
    this.applyTheme(this.theme());
  }

  private getInitialTheme(): Theme {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme && Object.values(Theme).includes(savedTheme as Theme)) {
      return savedTheme as Theme;
    }
    
    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return Theme.Dark;
    }
    
    // Default to light theme
    return Theme.Light;
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    if (theme === Theme.Light) {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
    }
    
    // Also set Tailwind dark mode class
    const html = document.documentElement;
    if (theme === Theme.Dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }

  setTheme(theme: Theme): void {
    this._themeSignal.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  toggleTheme(): void {
    const newTheme = this.isDarkTheme() ? Theme.Light : Theme.Dark;
    this.setTheme(newTheme);
  }

  // Method to get current theme as string
  getCurrentTheme(): string {
    return this.theme();
  }

  // Method to check if theme is dark
  isDark(): boolean {
    return this.isDarkTheme();
  }

  // Method to check if theme is light
  isLight(): boolean {
    return this.isLightTheme();
  }
} 