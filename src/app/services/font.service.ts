import { Injectable, signal } from '@angular/core';

export enum FontPreset {
  Default = 'default',
  RobotoFlex = 'roboto-flex',
  Ubuntu = 'ubuntu',
  Savate = 'savate',
  Caprasimo = 'caprasimo',
  Outfit = 'outfit',
  OpenSans = 'open-sans'
}

@Injectable({
  providedIn: 'root'
})
export class FontService {
  private readonly FONT_KEY = 'app-theme-font';
  private readonly FONT_CLASS_PREFIX = 'theme-font-';
  private readonly FONT_SEQUENCE: FontPreset[] = [
    FontPreset.Default,
    FontPreset.RobotoFlex,
    FontPreset.Ubuntu,
    FontPreset.Savate,
    FontPreset.Caprasimo,
    FontPreset.Outfit,
    FontPreset.OpenSans
  ];

  private _fontSignal = signal<FontPreset>(this.getInitialFont());
  readonly font = this._fontSignal.asReadonly();

  constructor() {
    this.applyFont(this.font());
  }

  private getInitialFont(): FontPreset {
    const savedFont = localStorage.getItem(this.FONT_KEY);
    if (savedFont && Object.values(FontPreset).includes(savedFont as FontPreset)) {
      return savedFont as FontPreset;
    }

    return FontPreset.Default;
  }

  private applyFont(font: FontPreset): void {
    const body = document.body;
    const fontClassNames = Object.values(FontPreset)
      .filter((value) => value !== FontPreset.Default)
      .map((value) => `${this.FONT_CLASS_PREFIX}${value}`);

    body.classList.remove(...fontClassNames);
    if (font !== FontPreset.Default) {
      body.classList.add(`${this.FONT_CLASS_PREFIX}${font}`);
    }
  }

  setFont(font: FontPreset): void {
    this._fontSignal.set(font);
    this.applyFont(font);
    localStorage.setItem(this.FONT_KEY, font);
  }

  selectNextFont(): void {
    const currentFont = this.font();
    const currentIndex = this.FONT_SEQUENCE.indexOf(currentFont);
    const nextIndex = currentIndex >= 0
      ? (currentIndex + 1) % this.FONT_SEQUENCE.length
      : 0;

    this.setFont(this.FONT_SEQUENCE[nextIndex]);
  }

  getCurrentFont(): FontPreset {
    return this.font();
  }
}