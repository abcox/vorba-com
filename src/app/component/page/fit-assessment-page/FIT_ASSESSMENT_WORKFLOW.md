# Fit-Assessment Workflow Intent

## Why This Workflow Exists

The fit-assessment flow is a guided intake that captures client-perceived:

1. Size of opportunity and complexity
2. Scope and context
3. Urgency and readiness
4. Value at stake

Its purpose is to translate those answers into the right next action for each segment, while keeping the client in control of the path they choose.

## Core Intent

1. Help prospects self-identify the right level of engagement.
2. Reduce friction for low-commitment paths.
3. Provide faster commitment options for high-urgency/high-value needs.
4. Keep recommendations client-centered and transparent.

## Segments (Current)

1. Individual
2. SMB
3. Enterprise

These three are sufficient for V1 and map clearly to differentiated outcomes.

## Additional Segments (Optional, Not Required for V1)

1. Startup/Scale-up
2. Nonprofit
3. Public sector/Government

Recommendation: Keep V1 at three segments and treat these as tags or qualifiers first, not new top-level segments.

## Segment-Specific Path Strategy

## Individual

Primary objective: Offer accessible and low-friction options.

Suggested offers:

1. One-on-one coaching/training
2. Join discussion forum/community
3. Free offerings and self-serve guidance

Default recommendation behavior:

1. Lower urgency/value: free resources + forum
2. Medium urgency/value: coaching consult option
3. High urgency/value: paid discovery call option

## SMB

Primary objective: Capture enough context to quickly scope practical help.

Inputs to capture:

1. Company name (for personalization and qualification context)
2. Team count and average team size
3. Scope and business context
4. Urgency/readiness window
5. Value/risk impact
6. Optional free-form text to provide some details (context)
7. Optional booking intent

Suggested next paths:

1. Book paid discovery (urgent/high-value)
2. Request scoped proposal and follow-up call
3. Review case studies/work and re-engage
4. Start with free action plan (non-urgent)

## Enterprise

Primary objective: Collect intake details for a consultative, high-touch path.

Inputs to capture:

1. Company name (required or strongly encouraged)
2. Multi-team scope and program context
3. Constraints and timeline urgency
4. Risk/compliance/operational impact
5. Stakeholder and decision model

Suggested next paths:

1. Discovery and strategy session
2. Enterprise intake review call
3. Custom proposal process

## Decision Dimensions Used By Recommendations

1. Segment
2. Company name/company context
3. Problem value band
4. Readiness/urgency
5. Team sizing and complexity
6. Free-form context notes

## Qualification Intent

The workflow should do both qualification and nurture, not just filtering:

1. Identify strong, high-value opportunities that should move quickly to conversation.
2. Route unclear or lower-value opportunities into lighter-weight nurture paths.
3. Preserve goodwill by ensuring every prospect leaves with a useful next step.

## Personalization Strategy (SMB and Enterprise)

When a user selects SMB or Enterprise, capture company name early and use it to personalize language and next-step messaging.

Examples:

1. "Great, we can tailor this for Acme Co."
2. "For Acme Co., the fastest next step is a scoped discovery call."

This can improve relevance and increase readiness to engage.

## Step Placement Options For Company Name

Option A: In-segment capture (preferred for V1)

1. User selects SMB/Enterprise.
2. Immediate inline field requests company name.
3. Continue into existing questions with personalized copy.

Option B: Intro step after segment selection

1. User selects SMB/Enterprise.
2. Next step is a short intro screen with company-name field.
3. Optional media (video intro) and then continue.

Recommendation:

1. Use Option A in V1 for lower complexity and less drop-off risk.
2. Keep Option B as a roadmap enhancement.

## Output Contract For The Wizard (Product Intent)

The workflow should produce a normalized recommendation object, independent of UI:

1. `recommendedPath`: one of `book_paid`, `waitlist`, `free_plan`, or `proposal`
2. `recommendedOffers`: ranked list of offer identifiers
3. `reasoningSummary`: plain-language explanation shown to client
4. `ctaOptions`: primary and secondary call-to-action choices

## UX Principles

1. Show recommendation as guidance, not gatekeeping.
2. Always allow client override of suggested path.
3. Keep enterprise and SMB copy outcome-focused, not form-heavy.
4. Preserve momentum from assessment to next action in one step.

## V1 Working Decisions

1. Keep three top-level segments only: Individual, SMB, Enterprise.
2. Differentiate offers and CTAs by segment.
3. Keep recommendation explainable in one short sentence.
4. Connect recommendation output to cart/checkout handoff in a later phase.
5. For SMB and Enterprise, ask for company name and use it for lightweight personalization.
6. Keep personalization text-first in V1 (no video dependency).

## Roadmap: Feature Ideas (Post-V1)

1. Intro step for SMB/Enterprise with a short founder/consultant video introduction.
2. Personalized video variants by segment or urgency band.
3. Company-name based dynamic microcopy across subsequent steps.
4. Confidence score to classify opportunity as high-value, nurture, or unclear.
5. Nurture tracks with tailored resource bundles and timed follow-up nudges.
6. CRM enrichment and deduplication using company name + work email.
7. A/B test intro-step variants: no-video vs video vs text testimonial.
8. Lightweight lead scoring explanation shown internally, hidden from prospect UI.

## Open Questions

1. Should Individual include a low-cost paid mini-assessment option?
2. For SMB non-urgent cases, should default CTA be case-study review or free plan?
3. Should Enterprise always route to human intake before any direct checkout path?
