import { Directive, Input, OnInit, OnDestroy, HostListener, ElementRef, inject } from '@angular/core';

export interface HotkeyConfig {
  key: string;
  callback: () => void;
  description?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

@Directive({
  selector: '[appHotkey]',
  standalone: true
})
export class HotkeyDirective implements OnInit, OnDestroy {
  @Input('appHotkey') hotkey!: string;
  @Input() hotkeyCallback!: () => void;
  @Input() hotkeyDescription?: string;
  @Input() hotkeyPreventDefault = true;
  @Input() hotkeyStopPropagation = false;
  @Input() hotkeyEnabled = true;

  private elementRef = inject(ElementRef);
  private isActive = false;
  private pressedKeys = new Set<string>();

  ngOnInit(): void {
    if (!this.hotkey || !this.hotkeyCallback) {
      console.warn('HotkeyDirective: hotkey and hotkeyCallback are required');
      return;
    }
    
    this.isActive = true;
    console.log(`Hotkey registered: ${this.hotkey} - ${this.hotkeyDescription || 'No description'}`);
  }

  ngOnDestroy(): void {
    this.isActive = false;
    this.resetKeyState();
    console.log(`Hotkey unregistered: ${this.hotkey}`);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive || !this.hotkeyEnabled) {
      return;
    }

    if (event.repeat) {
      return;
    }

    const key = this.normalizeKey(event.key);
    if (!key) {
      return;
    }

    if (!this.isModifierKey(key)) {
      this.pressedKeys.add(key);
    }

    if (this.matchesHotkey(event)) {
      if (this.hotkeyPreventDefault) {
        event.preventDefault();
      }
      
      if (this.hotkeyStopPropagation) {
        event.stopPropagation();
      }

      // Add visual feedback to the element
      this.addVisualFeedback();
      
      // Execute callback
      this.hotkeyCallback();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    const key = this.normalizeKey(event.key);
    if (!key) {
      return;
    }

    if (!this.isModifierKey(key)) {
      this.pressedKeys.delete(key);
    }
  }

  @HostListener('window:blur')
  handleWindowBlur(): void {
    this.resetKeyState();
  }

  private matchesHotkey(event: KeyboardEvent): boolean {
    const parsed = this.parseHotkey(this.hotkey);

    if (parsed.ctrl && !(event.ctrlKey || event.metaKey)) {
      return false;
    }

    if (parsed.alt && !event.altKey) {
      return false;
    }

    if (parsed.shift && !event.shiftKey) {
      return false;
    }

    if (parsed.keys.length === 0) {
      return false;
    }

    if (this.pressedKeys.size !== parsed.keys.length) {
      return false;
    }

    return parsed.keys.every((value) => this.pressedKeys.has(value));
  }

  private parseHotkey(keyString: string): {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    keys: string[];
  } {
    const normalized = this.normalizeKeyString(keyString);
    const parts = normalized.split('+').filter(Boolean);

    return {
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      keys: parts
        .filter((value) => !['ctrl', 'alt', 'shift'].includes(value))
        .map((value) => this.normalizeKey(value))
    };
  }

  private normalizeKey(key: string | null | undefined): string {
    const normalized = String(key ?? '').toLowerCase();
    if (!normalized) {
      return '';
    }

    switch (normalized) {
      case ' ':
        return 'space';
      case 'escape':
        return 'esc';
      case 'control':
        return 'ctrl';
      case '>':
      case '.':
        return 'period';
      case '<':
      case ',':
        return 'comma';
      default:
        return normalized;
    }
  }

  private isModifierKey(key: string): boolean {
    return ['ctrl', 'alt', 'shift', 'meta'].includes(key);
  }

  private resetKeyState(): void {
    this.pressedKeys.clear();
  }

  private normalizeKeyString(keyString: string): string {
    return keyString.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/command/g, 'ctrl') // Mac compatibility
      .replace(/cmd/g, 'ctrl')
      .replace(/meta/g, 'ctrl');
  }

  private addVisualFeedback(): void {
    const element = this.elementRef.nativeElement;
    
    // Add a brief visual feedback class
    element.classList.add('hotkey-activated');
    
    // Remove the class after a short duration
    setTimeout(() => {
      element.classList.remove('hotkey-activated');
    }, 200);
  }
}