
import { Component, computed, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '@file-service-api/v1';
import { PaymentIntent } from '@stripe/stripe-js';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PaymentIntentView } from '../invoice-list-view/invoice-list-view.component';

@Component({
  standalone: true,
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
  imports: [CommonModule]
})
export class InvoiceDetailComponent {
    private paymentService = inject(PaymentService);

    //@Output() selected = new EventEmitter<PaymentIntent>();
    //value = input<PaymentIntentView | null | undefined>(undefined)
    //selectedId = input<string | null>(null);

  route = inject(ActivatedRoute);
  // get query param pi
  id = toSignal(this.route.queryParamMap.pipe(
        map(params => params.get('pi'))
    ));
  //detail = signal<PaymentIntent | null>(null);
  detail = input<PaymentIntentView | null>(null);

  constructor() {
    // effect(() => {
    //    const id = this.id();
    //    //console.log('Fetching intent for ID:', id);
    //    if (id) {
    //        this.paymentService.paymentControllerRetrievePaymentIntent(id).subscribe((intent: PaymentIntent) => {
    //            console.log('Fetched Payment Intent:', intent);
    //            this.detail.set(intent);
    //            this.selected.emit(intent);
    //        });
    //    }
    //    return {} as PaymentIntent;
    //});
  }
  get amount(): string {
  const amt = this.detail()?.amount;
  const num = Number(amt);
  return isNaN(num) ? '' : (num / 100).toFixed(2);
}
}
