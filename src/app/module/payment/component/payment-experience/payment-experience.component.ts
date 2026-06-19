import { Component, computed, input } from '@angular/core';
import { PaymentIntent } from '@stripe/stripe-js';
import { PaymentCartComponent } from '../payment-cart/payment-cart.component';
import { PaymentCheckoutComponent } from '../payment-checkout/payment-checkout.component';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { PaymentCartLineItem, PaymentCheckoutSummary } from '../../model/payment-checkout.model';

/**
 * Composes reusable cart, checkout, and payment views for hosted and embedded flows.
 */
@Component({
  standalone: true,
  imports: [PaymentCartComponent, PaymentCheckoutComponent, PaymentFormComponent],
  selector: 'app-payment-experience',
  templateUrl: './payment-experience.component.html',
  styleUrls: ['./payment-experience.component.scss']
})
export class PaymentExperienceComponent {
  title = input('Payment');
  intent = input<PaymentIntent | null>(null);
  errorMessage = input<string | null>(null);
  cartItems = input<PaymentCartLineItem[]>([]);
  checkoutSummary = input<PaymentCheckoutSummary | null>(null);
  paymentRouteExample = input('/payment?pi=pi_123');

  hasCart = computed(() => this.cartItems().length > 0);
  hasCheckout = computed(() => this.checkoutSummary() !== null);
}