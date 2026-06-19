# Payment Module Plan

## Purpose

This module owns payment-related user experiences and the checkout flow UI for frontend use cases:

- Hosted route flow (for example `/payment`).
- Embedded flow inside other pages (for example fit-assessment or offer pages).

The route page should remain a thin adapter. Reusable payment, cart, and checkout views should live in this module.

## Problem We Are Solving

Current behavior can fetch payment intent details directly by intent id from the hosted page. That is useful for admin/test scenarios, but not ideal for public checkout.

For public users, we need a controlled flow where the backend validates selected catalog items, computes totals server-side, creates invoice/order snapshots, creates a Stripe PaymentIntent, and then returns safe payment context for UI rendering.

## Target Flow

1. User discovers services (fit-assessment, offers, or direct catalog).
2. User adds services to cart.
3. User reviews or adjusts cart in checkout.
4. User commits to pay.
5. Frontend calls `checkout-init` endpoint.
6. Backend validates request and computes total server-side.
7. Backend creates invoice/order snapshot and PaymentIntent.
8. Frontend renders payment experience with returned payment context.
9. Backend confirms final status from payment events and marks booking/fulfillment state.

## Core Concepts

- Catalog item: admin-managed service or product available for sale.
- Cart: mutable selection of catalog items.
- Checkout session: user-facing progression from cart to payment commit.
- Invoice/order snapshot: immutable record at payment commit.
- Payment context: safe frontend payload needed to render payment UI.

## Frontend Responsibilities

- Maintain cart and checkout UI states.
- Never treat client-calculated totals as authoritative.
- Call backend `checkout-init` only when user commits to payment.
- Render clear error states for missing/invalid payment context.
- Support route-hosted and embedded usage with shared components.

## Backend Responsibilities (Contract Expectations)

- Expose admin catalog management APIs.
- Expose public sellable-catalog API with safe fields only.
- Expose public checkout APIs (`draft`, `update`, `init`).
- Recompute pricing server-side from authoritative catalog/rules.
- Use idempotency for checkout-init and payment-intent creation.
- Return public-safe payment payload and status views.

## Proposed API Contracts (V1)

### Public

- `GET /api/catalog/public`
  - List active sellable services.
- `POST /api/checkout/draft`
  - Create draft cart/checkout session.
- `PATCH /api/checkout/draft/:id`
  - Update cart items, quantities, and contact details.
- `POST /api/checkout/init`
  - Validate, price, snapshot, and create payment intent.
  - Returns payment context for UI.
- `GET /api/checkout/:id/status`
  - Public-safe checkout/payment status.

### Admin

- `POST /api/catalog/item`
- `PATCH /api/catalog/item/:id`
- `PATCH /api/catalog/item/:id/archive`
- `GET /api/catalog/item`

## Payment Module Component Plan

### Existing

- `PaymentFormComponent`: Stripe payment element and submission handling.
- `PaymentExperienceComponent`: composed payment experience view.
- `PaymentCartComponent`: cart display/editing view.
- `PaymentCheckoutComponent`: checkout review and commit action.

### Planned Enhancements

1. Add a checkout session service in this module for state orchestration.
2. Add clear state machine for view states:
   - `empty`, `draft`, `review`, `initializing-payment`, `ready-to-pay`, `processing`, `success`, `error`.
3. Add route adapter mapping from query params to module inputs.
4. Add typed request/response models for checkout-init/status.

## Fit-Assessment Integration Plan

1. Fit-assessment outputs recommended service items.
2. User can accept/adjust recommendation into cart.
3. Route to checkout (or embed checkout panel) with seeded cart.
4. Commit action calls `checkout-init`.
5. On success, show payment view and finalize booking confirmation path.

## Implementation Phases

### Phase 1: Contract and Models

- Define frontend models for catalog item, cart item, checkout session, and payment context.
- Align with backend DTO naming for generated client compatibility.

### Phase 2: Checkout State

- Implement module-level checkout session service.
- Wire cart and checkout components to shared state.

### Phase 3: Backend Integration

- Replace direct public PI retrieval assumptions with checkout-init response usage.
- Keep admin payment-intent APIs admin-only.

### Phase 4: Fit-Assessment Wiring

- Map fit-assessment recommendations into checkout cart seed.
- Add CTA handoff to checkout route/component.

### Phase 5: Reliability and UX

- Add robust error/retry UI.
- Add payment status polling or token-based refresh view.
- Add post-payment confirmation and booking state synchronization.

## Open Decisions

1. Where to persist draft checkout sessions for anonymous users (local storage + backend token, or backend-only).
2. Whether tax and discount rules are needed in V1.
3. Whether we support multi-currency in V1 or lock to one currency.
4. How long checkout sessions and pending intents remain valid before expiration.

## Non-Goals (V1)

- Full subscription billing lifecycle.
- Complex promotion stacking engine.
- Broad public access to raw payment-intent retrieval endpoints.
