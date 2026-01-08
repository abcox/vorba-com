
import { Component, effect, input, ElementRef, inject, computed, signal } from '@angular/core';
import { PaymentIntentResult, Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';
import { StripeService, } from 'src/app/core/services/payment/stripe.service';
import { PaymentIntent } from '@stripe/stripe-js';
import { PaymentService } from '@file-service-api/v1';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';

//const stripePromise = loadStripe('STRIPE_API_PUBLIC_KEY'); // replace with your public key

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

    intent = input<PaymentIntent>(); // payment intent client secret
    
    private stripe: Stripe | null = null;
    private elements: StripeElements | null = null;
    private paymentElement: StripePaymentElement | null = null;

    paymentReceived = computed(() => {
        const intent = this.intent();
        return intent?.status === 'succeeded';
    });

    latestChargeId = signal<string| null>(null);
    receiptUrl = signal<string | null>(null);

    constructor(private host: ElementRef) {
        effect(async () => {
            const intent = this.intent();
            if (!intent) return;
            const { status, client_secret: clientSecret, latest_charge: latestCharge } = intent as any;
            if (status === 'succeeded') {
                this.fetchAndSetReceiptUrl(latestCharge);
            } else if (status === 'requires_payment_method') {
                this.mountPaymentElement(clientSecret);
            } else if (status === 'requires_confirmation') {
                console.warn('Payment requires confirmation - implement as needed');
            } else if (status === 'requires_action') {
                console.warn('Payment requires confirmation - implement as needed');
            } else {
                console.warn('Payment status unknown:', status);
            }
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
            clientSecret: clientSecret,
            appearance: {
                // Customize appearance here
            },
        });
        this.paymentElement = this.elements.create('payment', { layout: 'accordion' });
        this.paymentElement.mount('#payment-element');
    }

    async onSubmit(event: Event) {
        event.preventDefault();
        if (!this.stripe || !this.elements) return;
        const form = this.host.nativeElement.querySelector('#payment-form');
        if (!form) return;
        const result: PaymentIntentResult = await this.stripe.confirmPayment({
            elements: this.elements,
            confirmParams: {
                // Optionally pass a return_url
                // return_url: 'https://your-site.com/order/complete',
            },
            redirect: 'if_required',
        });
        const { error, paymentIntent: intent } = result;
        if (error) {
            alert(error.message);
        } else {
            alert('Payment submitted!');
            //this.intent.update(() => intent);
            const { latest_charge } = (intent as any);
            if (latest_charge) {
                window.open(latest_charge.receipt_url, '_blank');
            }
        }
    }
}
