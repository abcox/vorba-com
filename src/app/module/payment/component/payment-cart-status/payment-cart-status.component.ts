import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

/**
 * Header-friendly cart status control with optional item-count badge.
 */
@Component({
  selector: 'app-payment-cart-status',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './payment-cart-status.component.html',
  styleUrls: ['./payment-cart-status.component.scss'],
})
export class PaymentCartStatusComponent {
  itemCount = input(0);
  checkoutLink = input('/payment');
}
