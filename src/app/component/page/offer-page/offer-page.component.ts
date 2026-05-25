import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { OFFER_PAGE_CONTENT, OfferPackage } from './offer-page.data';

@Component({
  selector: 'app-offer-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, RouterModule],
  templateUrl: './offer-page.component.html',
  styleUrl: './offer-page.component.scss'
})
/**
 * Displays public offer guidance and pricing bands.
 */
export class OfferPageComponent {
  private router = inject(Router);

  content = OFFER_PAGE_CONTENT;

  /**
   * Navigates to contact and passes the selected offer id when available.
   */
  requestQuote(offer?: OfferPackage): void {
    this.router.navigate(['/home'], {
      queryParams: offer ? { offer: offer.id } : undefined,
      fragment: 'contact-form'
    });
  }

  /**
   * Opens the meeting invitation flow.
   */
  scheduleCall(): void {
    this.router.navigate(['/meeting/invite']);
  }
}
