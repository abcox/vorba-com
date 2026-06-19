import { Component, computed, effect, ElementRef, inject, input, signal } from '@angular/core';
import { PaymentIntent, PaymentIntentResult, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { MatIconModule } from '@angular/material/icon';
import { PaymentService } from '@file-service-api/v1';
import { StripeService } from '@src/app/core/services/payment/stripe.service';

/**
 * Renders the Stripe payment element for an existing payment intent.
 */
@Component({
  standalone: true,
  imports: [MatIconModule],
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
  stripeService = inject(StripeService);
  paymentService = inject(PaymentService);

  heading = input('Payment');
  intent = input<PaymentIntent | null>(null);

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private paymentElement: StripePaymentElement | null = null;

  paymentReceived = computed(() => this.intent()?.status === 'succeeded');

  receiptUrl = signal<string | null>(null);

  constructor(private host: ElementRef) {
    effect(async () => {
      const intent = this.intent();
      if (!intent) {
        return;
      }

      const { status, client_secret: clientSecret, latest_charge: latestCharge } = intent as any;
      if (status === 'succeeded' && latestCharge) {
        this.fetchAndSetReceiptUrl(latestCharge);
        return;
      }

      if (status === 'requires_payment_method') {
        await this.mountPaymentElement(clientSecret);
        return;
      }

      if (status === 'requires_confirmation' || status === 'requires_action') {
        console.warn('Payment requires additional confirmation state handling');
        return;
      }

      console.warn('Payment status unknown:', status);
    });
  }

  fetchAndSetReceiptUrl(chargeId: string) {
    this.paymentService.paymentControllerGetCharge(chargeId).subscribe(charge => {
      this.receiptUrl.set(charge.receipt_url);
    });
  }

  async mountPaymentElement(clientSecret: string | null) {
    if (clientSecret === null) {
      console.warn('Cannot present payment: clientSecret is null');
      return;
    }

    if (this.paymentElement) {
      console.warn('Payment element already mounted');
      return;
    }

    this.stripe = await this.stripeService.getStripe();
    if (!this.stripe) {
      console.error('Stripe failed to load');
      return;
    }

    this.elements = this.stripe.elements({
      clientSecret,
      appearance: {},
    });
    this.paymentElement = this.elements.create('payment', { layout: 'accordion' });
    this.paymentElement.mount('#payment-element');
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (!this.stripe || !this.elements) {
      return;
    }

    const form = this.host.nativeElement.querySelector('#payment-form');
    if (!form) {
      return;
    }

    const result: PaymentIntentResult = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {},
      redirect: 'if_required',
    });
    const { error, paymentIntent: intent } = result;
    if (error) {
      alert(error.message);
      return;
    }

    alert('Payment submitted!');
    const { latest_charge: latestCharge } = (intent as any);
    if (latestCharge?.receipt_url) {
      window.open(latestCharge.receipt_url, '_blank');
    }
  }
}