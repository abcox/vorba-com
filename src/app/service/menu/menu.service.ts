import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, take, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private router = inject(Router);
  private _menuOpen = signal<boolean>(false);

  constructor() {
    // observe router event NavigationEnd
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => this.closeMenu()), // close menu when navigation end
      takeUntilDestroyed()
    ).subscribe();
  }

  menuOpen = this._menuOpen.asReadonly();

  toggleMenu() {
    this._menuOpen.update(value => !value);
  }

  closeMenu() {
    this._menuOpen.set(false);
  }
}
