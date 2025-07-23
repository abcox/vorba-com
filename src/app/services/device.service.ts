// src/app/services/device.service.ts
import { Injectable, computed, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  // Signal to hold the current mobile state
  private _isMobile = signal(false);

  // Public readonly signal
  readonly isMobile = computed(() => this._isMobile());

  constructor(breakpointObserver: BreakpointObserver) {
    breakpointObserver.observe([Breakpoints.XSmall]).subscribe(result => {
      this._isMobile.set(result.matches);
    });
  }
}
