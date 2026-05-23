# Service Page Theme Assessment (Baseline)

Date: 2026-05-23
Scope: Light/dark consistency review for `/services` as first target for broader theme cleanup.

## Why this file exists

This captures the current baseline findings before iterative styling changes.
Use this as the reference point for future passes so we can compare visual behavior and avoid regressions.

## Observed baseline differences

1. Service description/body text in light mode appears too saturated relative to heading hierarchy.
2. Top shell/nav accenting can feel disconnected from service-page card palette.
3. Light-mode card separation (surface vs page background) is present but still subtle in places.
4. Dark mode card/readability balance is much improved after introducing local service-page tokens.

## Working hypothesis

- The page is now structurally tokenized enough for fast iteration.
- Most remaining visual inconsistencies are token-value tuning, not architecture changes.

## Suggested first tuning pass

1. Keep heading emphasis as-is and reduce saturation for body/supporting text in light mode.
2. Slightly strengthen light-mode card boundary (border/shadow tuning only).
3. Align shell/nav accent usage with service-page semantic tokens where practical.
4. Re-check CTA area contrast in both themes after text color adjustments.

## Validation loop

1. Manual check in browser on `/services` in both themes.
2. Run focused Playwright spec: `tests/e2e/service-page-theme.spec.ts`.
3. Capture screenshots per pass and compare against previous pass.

## Notes

- Keep detailed cross-cutting theming guidance in docs-level files.
- Keep feature-local implementation notes short and close to feature folders where needed.
