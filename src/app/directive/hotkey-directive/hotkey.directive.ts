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
    console.log(`Hotkey unregistered: ${this.hotkey}`);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isActive || !this.hotkeyEnabled) {
      return;
    }

    const pressedKey = this.buildKeyString(event);
    const targetKey = this.normalizeKeyString(this.hotkey);

    if (pressedKey === targetKey) {
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

  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');

    // Handle special keys
    let key = event.key?.toLowerCase();
    
    // Normalize common key variations
    switch (key) {
      case ' ':
        key = 'space';
        break;
      case 'escape':
        key = 'esc';
        break;
      default:
        break;
    }
    
    parts.push(key);
    return parts.join('+');
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