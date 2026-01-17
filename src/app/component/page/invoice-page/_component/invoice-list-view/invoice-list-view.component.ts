import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { PaymentService, StripePaymentIntentDto } from '@file-service-api/v1';
import { toSignal } from '@angular/core/rxjs-interop';
import { last, map } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDialogClose } from "@angular/material/dialog";
import { InvoiceDetailComponent } from '../invoice-detail';

export interface PaymentIntentView {
  id: string;
  status: string;
  amount: string;
  currency: string;
  recipientEmail: string;
  description: string;
  intent?: StripePaymentIntentDto;
  detailRow?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-invoice-list-view',
  templateUrl: './invoice-list-view.component.html',
  styleUrls: ['./invoice-list-view.component.scss'],
  imports: [CommonModule, InvoiceDetailComponent, MatIconModule, MatTableModule, MatButtonModule, RouterModule, MatFormFieldModule, MatDialogClose]
})
export class InvoiceListViewComponent {
    //private router = inject(RouterModule);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private paymentService = inject(PaymentService);

    intentList = input<StripePaymentIntentDto[]>([]);
    intentListView = input<PaymentIntentView[]>([]);
    @Output() selected = new EventEmitter<PaymentIntentView>();
    
    //activeRowId = signal<string | null>(null);
    activeRowId = input<string | null>(null);

    id = toSignal(this.route.queryParamMap.pipe(
        map(params => params.get('pi')),
    ));

  displayedColumns: string[] = [/* 'id', */'recipientEmail', 'description', 'status', 'amount', 'actions', 'expand'];
  //dataSource = signal<PaymentIntentView[]>([]);
  dataSource = signal<PaymentIntentView[]>([]);
  selectedRow = signal<any | null>(null);

  intents$ = this.paymentService.getPaymentIntentList().pipe(
    map(response => response.list)
  );
  intents = toSignal(this.intents$);

  constructor() {
    // assign table source data when intents change (via service)
    //effect(() => {
    //  const intents = this.intents();
    //  if (intents) {
    //    const intentListView = this.getIntentListView(intents);
    //    this.dataSource.set(intentListView);
    //  }
    //}, { allowSignalWrites: true });
    
    // assign table source data when intents change (via input)
    effect(() => {
      const intentList = this.intentList();
      if (intentList) {
        const listView = this.getIntentListView(intentList);
        this.dataSource.set(listView);
      }
    }, { allowSignalWrites: true });

    // set active row when query param pi changes
    effect(() => {
      const pi = this.id();
      const dataSource = this.dataSource();
      if (pi && dataSource.length > 0) {
        //this.setActiveRowByPaymentIntentId(pi);
      }
    }, { allowSignalWrites: true });
  }

    getIntentListView(intents: StripePaymentIntentDto[]): PaymentIntentView[] {
        const result = intents.flatMap(intent => {
            const item: PaymentIntentView = {
                id: intent.id,
                status: this.statusForDisplay(intent.status),
                amount: `${(intent.amount / 100).toFixed(2)} ${intent.currency.toUpperCase()}`,
                currency: intent.currency,
                recipientEmail: intent.receipt_email?.toString() || '',
                description: intent.description?.toString() || '',
                intent: intent
            };
            // Insert the main row and its detail row
            return [
                item,
                { ...item, detailRow: true }
            ];
        });
        console.log('Generated intent list view with detail rows:', result);
        return result;
    }

    openReceipt(intentRow: any) {
      const chargeId = intentRow.intent?.latest_charge;
      if (!chargeId) return;
        console.log('Opening receipt for intent:', chargeId);
        this.paymentService.paymentControllerGetCharge(chargeId).subscribe(charge => {
        const url = charge.receipt_url;
            if (url) {
                window.open(url, '_blank');
            }
        });
    }

    //selectForDetailView(intentId: string) {
    //    if (!intentId) return;
    //    console.log('Selecting invoice for detail view');
    //    // add query param pi=intent.id
    //    this.router.navigate(['/invoice', 'new'], { queryParams: { pi: intentId } });
    //}

    setSelectedItemByRowId(rowId: string) {
        console.log(`Setting selected item by row ID:`, rowId);
        const selectedItem = this.dataSource().find(row => row.id === rowId);
        if (selectedItem) {
            this.selected.emit(selectedItem as PaymentIntentView);
            //this.activeRowId.set(rowId);
        }
    }

    // alias - since gpt insisted on toggleRow naming
    toggleRow = (row: any) => this.onRowClick(row);

    onRowClick(row: any) {
        console.log('Row clicked:', row);
        if (this.selectedRow() === row) {
            console.log('Deselecting row');
            this.selectedRow.set(null);
            return;
        }
        this.selectedRow.set(row);
    }

    isExpansionDetailRow = (index: number, row: PaymentIntentView | { detailRow: boolean }) => {
        const result = !!(row as any).detailRow;
        console.log(`isExpansionDetailRow index=${index} row=`, row, '->', result);
        return result;
    };
    isMainRow = (index: number, row: PaymentIntentView) => !row.detailRow;

    //setActiveRowByPaymentIntentId(intentId: string | null | undefined) {
    //    console.log(`Setting active row by intent ID:`, intentId);
    //    console.log(`Setting`, this.dataSource()[0]);
    //    if (!intentId) {
    //        this.activeRowId.set(null);
    //        return;
    //    }
    //    const rowId = this.dataSource().find(row => row.id === intentId)?.id || null;
    //    if (!rowId) return;
    //    console.log('Setting active row by intent ID:', intentId, '-> row ID:', rowId);
    //    this.activeRowId.set(rowId);
    //}

    //setActiveRow(value: any) {
    //    const { id } = value;
    //    console.log(`setActiveRow value`, value);
    //    this.activeRowId.set(id);
    //    this.selected.emit(value as PaymentIntentView);
    //}

  statusForDisplay(status: string): string {
    switch (status) {
      case 'requires_payment_method':
        return 'Pending Payment';
      case 'succeeded':
        return 'Paid';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
}

  viewDetail(id: string) {
    // Navigate to detail page or open dialog
    console.log('View detail for', id);
  }

  pay(id: string) {
    // Trigger payment flow
    console.log('Pay for', id);
  }

  cancel(id: string) {
    console.log('Cancel', id);
    this.paymentService.paymentControllerCancelPaymentIntent(id).pipe(last()).subscribe(updatedIntent => {
        console.log('Canceled intent:', updatedIntent);
        // Update local data source
        this.dataSource.set(this.dataSource().map(intent => 
            intent.id === updatedIntent.id ? {
                ...intent,
                status: updatedIntent.status,
                statusForDisplay: this.statusForDisplay(updatedIntent.status)
            } : intent
        ));
    });
  }
}
