# Payment Checkout Issue Checklist

This checklist converts the payment and checkout plan into trackable implementation issues.

## How To Use

- Create one GitHub issue per item below.
- Keep issue titles as-is for consistent tracking.
- Mark dependencies so issues are executed in order.
- Use acceptance criteria as the definition of done.

## Suggested Labels

- `payment`
- `checkout`
- `catalog`
- `backend`
- `frontend`
- `fit-assessment`
- `api-contract`
- `qa`

## Issue 1: Define Public Checkout API Contract

- Type: Backend foundation
- Depends on: none
- Scope:
  - Define DTOs for catalog, cart draft, checkout-init request/response, and public status.
  - Define idempotency strategy for checkout-init.
- Acceptance criteria:
  - API contract is documented and reviewed.
  - Request/response examples exist for each endpoint.
  - Error code matrix is defined for `400`, `401`, `404`, `409`, `422`, `500`.

## Issue 2: Build Admin Service Catalog CRUD

- Type: Backend
- Depends on: Issue 1
- Scope:
  - Add catalog item model with lifecycle states (`draft`, `active`, `archived`).
  - Add admin endpoints for create, update, archive, and list.
- Acceptance criteria:
  - Admin can manage sellable services and price options.
  - Archived items are excluded from public catalog.
  - Unit tests cover lifecycle transitions.

## Issue 3: Expose Public Sellable Catalog Endpoint

- Type: Backend
- Depends on: Issue 2
- Scope:
  - Implement public-safe catalog endpoint with only sellable fields.
  - Exclude internal/admin-only metadata.
- Acceptance criteria:
  - Public endpoint returns only active sellable items.
  - Contract tests confirm no sensitive fields are returned.

## Issue 4: Implement Checkout Draft Endpoints

- Type: Backend
- Depends on: Issue 1, Issue 3
- Scope:
  - Create checkout draft and update draft cart items.
  - Support anonymous session token or draft id strategy.
- Acceptance criteria:
  - Draft create and update endpoints are functional.
  - Quantity and item validation rules are enforced.
  - Expired or invalid draft handling is defined.

## Issue 5: Implement Checkout Init (Commit) Endpoint

- Type: Backend
- Depends on: Issue 1, Issue 4
- Scope:
  - Validate draft and recompute totals server-side.
  - Create immutable invoice/order snapshot.
  - Create Stripe PaymentIntent for the committed amount.
- Acceptance criteria:
  - Endpoint returns checkout id + payment context.
  - Repeated calls with same idempotency key do not duplicate invoice/PI.
  - Invalid catalog references return deterministic validation errors.

## Issue 6: Add Public Checkout Status Endpoint

- Type: Backend
- Depends on: Issue 5
- Scope:
  - Return public-safe status for checkout/payment progression.
  - Map payment states to UI-safe status values.
- Acceptance criteria:
  - Status endpoint can be called without admin role using safe token/id.
  - Response does not leak admin-only Stripe details.

## Issue 7: Frontend Checkout Session Service

- Type: Frontend foundation
- Depends on: Issue 1
- Scope:
  - Add a payment module service to manage cart and checkout state.
  - Implement view-state machine (`empty`, `draft`, `review`, `initializing-payment`, `ready-to-pay`, `processing`, `success`, `error`).
- Acceptance criteria:
  - Cart and checkout components share one source of truth.
  - State transitions are covered by unit tests.

## Issue 8: Frontend Cart And Checkout UI Wiring

- Type: Frontend
- Depends on: Issue 7, Issue 4
- Scope:
  - Wire cart and checkout components to backend draft APIs.
  - Show validation, loading, and retry states.
- Acceptance criteria:
  - User can add, remove, and update quantities.
  - UI reflects backend-validated totals.
  - Error states are understandable and recoverable.

## Issue 9: Frontend Payment Handoff From Checkout Init

- Type: Frontend
- Depends on: Issue 5, Issue 8
- Scope:
  - Replace public PI retrieval assumptions with checkout-init response usage.
  - Use returned payment context to render payment experience.
- Acceptance criteria:
  - Payment can be started without direct public PI fetch by id.
  - Hosted route and embedded usage both function.

## Issue 10: Fit-Assessment To Cart Integration

- Type: Frontend integration
- Depends on: Issue 8
- Scope:
  - Convert fit-assessment recommendation output into cart seed items.
  - Add CTA for user to continue into checkout flow.
- Acceptance criteria:
  - Recommendation can pre-populate checkout cart.
  - User can edit seeded cart before payment commit.

## Issue 11: Booking Confirmation Sync

- Type: Cross-cutting
- Depends on: Issue 6, Issue 9
- Scope:
  - Ensure booking confirmation reflects verified payment status.
  - Avoid client-only success assumptions.
- Acceptance criteria:
  - Successful payment results in confirmed booking state.
  - Failed/canceled payment does not create false booking confirmations.

## Issue 12: QA And E2E Coverage For Checkout Flow

- Type: QA
- Depends on: Issue 10, Issue 11
- Scope:
  - Add E2E for happy path, invalid item path, stale draft path, payment failure path.
  - Add API-level tests for checkout-init idempotency.
- Acceptance criteria:
  - E2E suite validates complete fit-assessment to checkout to payment flow.
  - Regression tests catch duplicate invoice/PI creation.

## Recommended Execution Order

1. Issue 1
2. Issue 2
3. Issue 3
4. Issue 4
5. Issue 5
6. Issue 6
7. Issue 7
8. Issue 8
9. Issue 9
10. Issue 10
11. Issue 11
12. Issue 12

## Milestone Mapping

- Milestone A: Contract + Catalog (`1-3`)
- Milestone B: Checkout Core (`4-6`)
- Milestone C: Frontend Checkout Experience (`7-9`)
- Milestone D: Fit-Assessment Integration + Reliability (`10-12`)
