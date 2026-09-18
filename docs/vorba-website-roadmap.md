# Vorba Website Roadmap

## Purpose
Track planned website improvements, with current priority focus on content alignment.

## Status
- Home page content review completed.
- Implementation intentionally deferred while quiz styling continues.

## Copy

### Home Page

#### Core Problem To Solve
The home page copy and CTA flow are not fully aligned:
- Hero cards make strategic promises, but CTA actions currently do not route users to concrete next steps.
- CTA labels across sections suggest different journeys (Learn More, Contact Us, Case Studies, Book a Meeting) without a clear primary conversion path.
- Tone shifts between high-level positioning copy and tactical checklist copy.

#### Roadmap

##### Phase 1: Align CTA Journey (Highest Priority)
Goal: Establish one clear primary conversion path and one secondary path.

Tasks:
- Define primary CTA for the page (recommended: Book a Meeting).
- Define one secondary CTA (recommended: View Services or View Case Studies).
- Update hero card CTA labels and actions to map to real routes or anchors.
- Remove placeholder callback-only actions (console logs) in hero offers.

Success criteria:
- Every visible CTA leads to a real destination.
- CTA naming is consistent with intended user journey.

##### Phase 2: Tighten Hero Messaging
Goal: Make value proposition outcome-oriented and specific.

Tasks:
- Rewrite hero descriptions to emphasize outcomes (speed to delivery, reduced modernization risk, scalable systems).
- Keep title/body language parallel across all offer cards.
- Reduce vague claims and increase clarity on who this is for.

Success criteria:
- User can identify audience, outcome, and next step within first screen.
- Card copy style is consistent card-to-card.

##### Phase 3: Refine About + Contact Narrative
Goal: Improve continuity between About section and contact panel.

Tasks:
- Compress About section into one concise lead paragraph plus brief supporting points.
- Align contact prompt tone with hero tone (consultative vs tactical).
- Keep checklist wording concise and less generic.

Success criteria:
- About and contact sections feel like one coherent story.
- Less repetition and stronger readability.

#### Draft Copy Direction (Working)
- Primary CTA: Book a Meeting
- Secondary CTA: Explore Services

Example hero tones:
- Build and launch your next product with confidence.
- Modernize legacy systems without disruption.
- Scale delivery with reliable, maintainable architecture.

#### File Targets For Future Edit
- src/app/component/page/home-page/home-page.component.ts
- src/app/component/page/home-page/home-page.component.html

#### Notes
- This section is intentionally scoped to home page copy and CTA alignment.
- Execute after the current quiz styling iteration is complete.

## Reliability Backlog

### App-Wide API Health Monitoring (Near-Term)
Goal: Ensure users are clearly informed when APIs are unavailable and prevent broken interaction flows.

Tasks:
- Add a centralized client health service that tracks backend availability (file-service and other required APIs).
- Add a global out-of-service modal pattern (similar to sign-in/session-timeout) that blocks user progression while required APIs are down.
- Ensure modal supports automatic recovery: dismiss only after health checks succeed.
- Add UI state indicators for "healthy", "degraded", and "out-of-service".

Success criteria:
- When API connectivity drops, users see a clear blocking state and cannot continue into broken operations.
- When API connectivity returns, the app recovers without page reload.

### API Recycle / File-Watcher Restart Investigation (Near-Term)
Goal: Reduce avoidable backend restarts during local development and understand current recycle triggers.

Tasks:
- Identify why backend restarts are being triggered during file-watch.
- Capture which files/folders trigger restarts and whether this is expected (generated files, logs, temp files, config copies, etc.).
- Adjust watch configuration or ignore patterns to reduce unnecessary recycle loops.

Success criteria:
- Local API watch-mode remains stable during normal UI and config workflow.
- Restart events are predictable and tied to intentional source edits.

### Offline Mode (Long-Term)
Goal: Provide graceful operation when backend connectivity is unavailable.

Tasks:
- Define a supported offline experience and scope (read-only vs queued writes).
- Add a persistent "Offline Mode" indicator with clear capability messaging.
- Define synchronization strategy for reconnect scenarios.

Success criteria:
- Users can understand current connectivity state and what actions are available.
- Reconnect behavior is explicit and reliable.
