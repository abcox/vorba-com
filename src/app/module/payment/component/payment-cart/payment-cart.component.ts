import { Component, input } from '@angular/core';
import { PaymentCartLineItem } from '../../model/payment-checkout.model';

/**
 * Displays the current cart contents for payment-related flows.
 */
@Component({
  standalone: true,
  selector: 'app-payment-cart',
  templateUrl: './payment-cart.component.html',
  styleUrls: ['./payment-cart.component.scss']
})
export class PaymentCartComponent {
  items = input<PaymentCartLineItem[]>([]);

  formatAmount(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }
}