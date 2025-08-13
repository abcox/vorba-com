import { computed, Injectable, signal } from '@angular/core';
import { ThemeService, Theme } from '../../../services/theme.service';

export enum DrawerMode {
  Side = 'side',
  Over = 'over'
}

export enum DrawerPosition {
  Start = 'start',
  End = 'end'
}

export type DrawerState = {
  opened: boolean;
  mode: DrawerMode;
  position: DrawerPosition;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private _titlePrefixSignal = signal<string>('');
  readonly titlePrefixSignal = this._titlePrefixSignal.asReadonly();

  //#region Drawer
  readonly drawerOpenedSignal = signal<boolean>(false);
  readonly drawerModeSignal = signal<DrawerMode>(DrawerMode.Side);
  readonly drawerPositionSignal = signal<DrawerPosition>(DrawerPosition.Start);
  //#endregion

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

  //#region Drawer  
  get drawerStateSignal() {
    return computed(() => ({
      opened: this.drawerOpenedSignal(),
      mode: this.drawerModeSignal(),
      position: this.drawerPositionSignal()
    }));
  }

  closeDrawer() {
    this.drawerOpenedSignal.set(false);
  }

  toggleDrawer(opened?: boolean) {
    this.drawerOpenedSignal.set(opened ?? !this.drawerOpenedSignal());
  }

  toggleDrawerMode(mode?: DrawerMode) {
    this.drawerModeSignal.set(mode ?? (this.drawerModeSignal() === DrawerMode.Side ? DrawerMode.Over : DrawerMode.Side));
  }

  toggleDrawerPosition(position?: DrawerPosition) {
    this.drawerPositionSignal.set(position ?? (this.drawerPositionSignal() === DrawerPosition.Start ? DrawerPosition.End : DrawerPosition.Start));
  }
  //#endregion

}
