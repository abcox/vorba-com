/**
 * Represents a priced line item shown in cart and checkout views.
 */
export interface PaymentCartLineItem {
  id?: string;
  label: string;
  description?: string;
  quantity?: number;
  amount: number;
  currency: string;
}

/**
 * Represents the checkout totals displayed before payment submission.
 */
export interface PaymentCheckoutSummary {
  subtotal: number;
  total: number;
  currency: string;
  tax?: number;
  discount?: number;
  note?: string;
}