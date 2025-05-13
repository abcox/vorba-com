import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  menuOpen = signal(false);

  constructor() { 
    effect(() => {
      console.log('menuOpen', this.menuOpen());
      /* if (this.menuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      } */
    });
  }

  toggleMenu() {
    console.log('toggleMenu');
    this.menuOpen.update(open => !open);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
}
