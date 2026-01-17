import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService } from '@file-service-api/v1/api/api';

@Component({
  standalone: true,
  selector: 'app-invoice-create-form',
  templateUrl: './invoice-create-form.component.html',
  styleUrls: ['./invoice-create-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class InvoiceCreateFormComponent {
    paymentService = inject(PaymentService);

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      recipientName: ['', Validators.required],
      recipientEmail: ['', [Validators.required, Validators.email]],
      amount: [null, [Validators.required, Validators.min(1)]],
      currency: ['usd', Validators.required],
      paymentType: ['card', Validators.required],
      description: [''],
    });
  }

  // pi_3SnPYFLm8WjfqU8o0Y8DLE5x
  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
      this.paymentService.paymentControllerCreatePaymentIntent({
        amount: this.form.value.amount * 100,
        currency: this.form.value.currency,
        //payment_method_types: [this.form.value.paymentType],
        receipt_email: this.form.value.recipientEmail,
        description: this.form.value.description
      }).subscribe(intent => {
        console.log('Created Payment Intent:', intent);
      });
    }
  }
}
