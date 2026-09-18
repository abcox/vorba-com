# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Playwright E2E testing setup with config, smoke test, and npm scripts (`e2e`, `e2e:ui`, `e2e:headed`, `e2e:debug`, `e2e:install`).
- Service page theme-aware styling and Playwright E2E tests for light/dark behavior parity and theme toggle flow.
- New Offers page at /offers with structured package, add-on, discount, and terms content.
- Dedicated offer page data model for easier future content updates.
- Header navigation entry and offers flyout content linking into offer page sections.
- New /release page to display client and API runtime metadata, replacing the earlier dialog-based approach.
- Payment and checkout implementation plan documentation under `src/app/module/payment/README.md`, covering public checkout-init flow, catalog governance, and fit-assessment integration phases.
- Payment checkout issue checklist under `src/app/module/payment/ISSUE_CHECKLIST.md` with sequenced backend/frontend work items, dependencies, and acceptance criteria.
- Admin panel drawer action to copy the active bearer token for local Swagger and API testing.
- Reliability backlog entries in roadmap for app-wide API health monitoring modal, local API file-watch recycle investigation, and future offline-mode support.

### Changed
- Refactored payment UI into a reusable payment feature area under `src/app/module/payment`, keeping the hosted payment page as a thin route adapter and adding reusable cart and checkout views.
- Updated quiz start-page copy to focus messaging on the MVP-to-sustainable product development transition.
- Restyled quiz start-page form and typography to align with active theme tokens, with focused dark-contrast adjustments.
- Refined quiz start-page light-contrast styling to better align heading and form readability with the active theme.
- Aligned menu dialog typography, selectors, divider, and toggle switch states to active theme palette colors, including accent-aware toggle outline/icon coloring.
- Tuned service page heading token contrast so service card headings better reflect active swatch hues in light and dark themes.
