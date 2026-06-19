import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '@file-service-api/v1/api/api';
import { PaymentExperienceComponent } from '@src/app/module/payment/component/payment-experience/payment-experience.component';

@Component({
    standalone: true,
    imports: [PaymentExperienceComponent],
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent {
    route = inject(ActivatedRoute)
    paymentService = inject(PaymentService);

    errorMessage = signal<string | null>(null);

    paymentIntentId$ = this.route.queryParams.pipe(
        map(params => {
            const byPi = (params['pi'] || '').trim(); // i.e. pi_3Smc5QLm8WjfqU8o021KnOzq
            const byStripeReturnParam = (params['payment_intent'] || '').trim();
            return byPi || byStripeReturnParam;
        }),
        tap(id => console.log('PaymentPageComponent - payment intent id from query params', id))
    );

    paymentIntent$ = this.paymentIntentId$.pipe(
        switchMap(id => {
            if (!id) {
                this.errorMessage.set('Missing payment intent id. Open this page with ?pi=<payment_intent_id>.');
                return of(null);
            }

            this.errorMessage.set(null);
            return this.paymentService.paymentControllerRetrievePaymentIntent(id).pipe(
                tap(intent => console.log('PaymentPageComponent - fetched payment intent', intent)),
                catchError((error) => {
                    const message = error?.status === 404
                        ? 'Payment intent not found. Confirm you are using a valid test intent id for this environment.'
                        : 'Unable to load payment details right now.';
                    this.errorMessage.set(message);
                    return of(null);
                })
            );
        })
    )

    paymentIntent = toSignal(this.paymentIntent$, { initialValue: null });
}
