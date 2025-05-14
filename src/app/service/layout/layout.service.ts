import { computed, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

export enum Theme {
  Light = 'light',
  Dark = 'dark'
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _themeSignal = signal<Theme>(Theme.Dark);
  readonly themeSignal = this._themeSignal.asReadonly();
  readonly isLightTheme = computed(() => this.themeSignal() === Theme.Light);

  constructor() { }

  toggleTheme() {
    this._themeSignal.update(theme => theme === Theme.Light ? Theme.Dark : Theme.Light);    
    if (this.themeSignal() === Theme.Light) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}
