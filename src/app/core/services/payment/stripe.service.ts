import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    // Use the publishable key from environment config
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }
}
