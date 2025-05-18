import { Injectable, signal, inject, effect } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, fromEvent, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private _menuOpen = signal<boolean>(false);
  menuOpen = this._menuOpen.asReadonly();
 
  constructor() {
    // observe router event NavigationEnd
    inject(Router).events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => this.closeMenu()), // close menu when navigation end
      takeUntilDestroyed()
    ).subscribe();

    // observe click outside menu to close menu
    effect(() => {
      fromEvent<MouseEvent>(document, 'click').subscribe(event => {
        const menuDialog = document.querySelector('.menu-dialog');
        const menuDialogClick = menuDialog?.contains(event.target as Node);
        const outsideClick = menuDialog ? !menuDialogClick : false;
        if (outsideClick) {
          this.closeMenu();
        }
      });
    });
  }

  toggleMenu() {
    this._menuOpen.update(value => !value);
  }

  closeMenu() {
    this._menuOpen.set(false);
  }
}
