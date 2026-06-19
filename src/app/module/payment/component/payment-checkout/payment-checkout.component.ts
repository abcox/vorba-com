import { Component, input } from '@angular/core';
import { PaymentCheckoutSummary } from '../../model/payment-checkout.model';

/**
 * Displays pricing totals for the current checkout session.
 */
@Component({
  standalone: true,
  selector: 'app-payment-checkout',
  templateUrl: './payment-checkout.component.html',
  styleUrls: ['./payment-checkout.component.scss']
})
export class PaymentCheckoutComponent {
  summary = input.required<PaymentCheckoutSummary>();

  formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}