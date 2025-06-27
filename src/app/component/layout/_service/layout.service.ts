import { computed, Injectable, signal } from '@angular/core';
import { ThemeService, Theme } from '../../../services/theme.service';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _titlePrefixSignal = signal<string>('');
  readonly titlePrefixSignal = this._titlePrefixSignal.asReadonly();

  constructor(private themeService: ThemeService) { }

  setTitlePrefix(value: string) {
    this._titlePrefixSignal.set(value);
  }

  clearTitlePrefix() {
    this._titlePrefixSignal.set('');
  }

  // Delegate theme operations to ThemeService
  get themeSignal() {
    return this.themeService.theme;
  }

  get isLightTheme() {
    return this.themeService.isLightTheme;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  setTheme(theme: Theme) {
    this.themeService.setTheme(theme);
  }
}
