import { Component, effect, inject } from '@angular/core';
import { PaymentFormComponent } from '../../forms/payment-form';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentService } from '@file-service-api/v1/api/api';

@Component({
    standalone: true,
    imports: [PaymentFormComponent],
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.scss']
})
export class PaymentPageComponent {
    route = inject(ActivatedRoute)
    paymentService = inject(PaymentService);    
    paymentIntentId$ = this.route.queryParams.pipe(
        map(params => (params['pi'] || '') as string), // i.e. pi_3Smc5QLm8WjfqU8o021KnOzq
        tap(secret => console.log('PaymentPageComponent - payment intent secret (query param: pi)', secret))
    );
    paymentIntent$ = this.paymentIntentId$.pipe(
        // Fetch PaymentIntent from API using the secret
        switchMap(pi => this.paymentService.paymentControllerRetrievePaymentIntent(pi)),
        tap(intent => console.log('PaymentPageComponent - fetched payment intent', intent))
    )
    paymentIntent = toSignal(this.paymentIntent$);
}
