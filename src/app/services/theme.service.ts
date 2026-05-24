import { Injectable, signal, computed } from '@angular/core';

export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

export enum ThemeSwatch {
  Default = 'default',
  Classic = 'classic',
  Ocean = 'ocean',
  Forest = 'forest',
  Ember = 'ember',
  Monochrome = 'monochrome'
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly SWATCH_KEY = 'app-theme-swatch';
  private readonly SWATCH_CLASS_PREFIX = 'theme-swatch-';
  private readonly SWATCH_SEQUENCE: ThemeSwatch[] = [
    ThemeSwatch.Default,
    ThemeSwatch.Classic,
    ThemeSwatch.Ocean,
    ThemeSwatch.Forest,
    ThemeSwatch.Ember,
    ThemeSwatch.Monochrome
  ];
  
  // Signal for theme state
  private _themeSignal = signal<Theme>(this.getInitialTheme());
  private _swatchSignal = signal<ThemeSwatch>(this.getInitialSwatch());
  
  // Computed values
  readonly theme = this._themeSignal.asReadonly();
  readonly swatch = this._swatchSignal.asReadonly();
  readonly isDarkTheme = computed(() => this.theme() === Theme.Dark);
  readonly isLightTheme = computed(() => this.theme() === Theme.Light);

  constructor() {
    this.applyTheme(this.theme());
    this.applySwatch(this.swatch());
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

  private getInitialSwatch(): ThemeSwatch {
    const savedSwatch = localStorage.getItem(this.SWATCH_KEY);
    if (savedSwatch && Object.values(ThemeSwatch).includes(savedSwatch as ThemeSwatch)) {
      return savedSwatch as ThemeSwatch;
    }

    return ThemeSwatch.Default;
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

  private applySwatch(swatch: ThemeSwatch): void {
    const body = document.body;
    const swatchClassNames = Object.values(ThemeSwatch)
      .filter((value) => value !== ThemeSwatch.Default)
      .map((value) => `${this.SWATCH_CLASS_PREFIX}${value}`);

    body.classList.remove(...swatchClassNames);
    if (swatch !== ThemeSwatch.Default) {
      body.classList.add(`${this.SWATCH_CLASS_PREFIX}${swatch}`);
    }
  }

  setTheme(theme: Theme): void {
    this._themeSignal.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  setSwatch(swatch: ThemeSwatch): void {
    this._swatchSignal.set(swatch);
    this.applySwatch(swatch);
    localStorage.setItem(this.SWATCH_KEY, swatch);
  }

  selectNextSwatch(): void {
    const currentSwatch = this.swatch();
    const currentIndex = this.SWATCH_SEQUENCE.indexOf(currentSwatch);
    const nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % this.SWATCH_SEQUENCE.length
      : 0;

    this.setSwatch(this.SWATCH_SEQUENCE[nextIndex]);
  }

  selectPreviousSwatch(): void {
    const currentSwatch = this.swatch();
    const currentIndex = this.SWATCH_SEQUENCE.indexOf(currentSwatch);
    const previousIndex = currentIndex >= 0
      ? (currentIndex - 1 + this.SWATCH_SEQUENCE.length) % this.SWATCH_SEQUENCE.length
      : this.SWATCH_SEQUENCE.length - 1;

    this.setSwatch(this.SWATCH_SEQUENCE[previousIndex]);
  }

  toggleTheme = (): void => {
    const newTheme = this.isDarkTheme() ? Theme.Light : Theme.Dark;
    this.setTheme(newTheme);
  };

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

  getCurrentSwatch(): ThemeSwatch {
    return this.swatch();
  }

  /**
   * Returns the path to a themed asset.
   * Convention: dark variant = `{name}.{ext}`, light variant = `{name}-light.{ext}`.
   * Example: themedAsset('vorba-logo') → 'assets/images/vorba-logo.svg' (dark)
   *                                    → 'assets/images/vorba-logo-light.svg' (light)
   */
  themedAsset(name: string, ext = 'svg', folder = 'assets/images'): string {
    const suffix = this.isLightTheme() ? '-light' : '';
    return `${folder}/${name}${suffix}.${ext}`;
  }
} 