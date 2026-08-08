# Quickstart: Validate the Sub-Tab Header Scrollbar Fix

## Prerequisites

- Local dev environment set up per `CLAUDE.md` (`npm install` already run).
- No environment variables required beyond what's already configured — the app falls back to mock data automatically if Salesforce credentials are absent, and this fix touches no data-fetching logic.

## Setup

```bash
npm run dev
```

Open `http://localhost:3000` and sign in (or use mock/dev session per existing project setup).

## Validation Scenarios

Perform each of these with the browser's device toolbar (or by manually narrowing the window) at a few representative narrow widths (e.g., ~375px, ~640px, ~768px), and repeat once in light mode and once in dark mode (see `components/ThemeContext.tsx` toggle).

1. **Reported page (regression check)**
   - Navigate to a Proposal detail page with multiple related-record sub-tabs (Proposals / Customer Quotes / Sales Orders / Shipping Manifests / Invoices) — matches the reported screenshot.
   - Narrow the viewport until the sub-tab labels no longer all fit.
   - **Expected**: the sub-tab row stays a single line; no vertical scrollbar appears anywhere in or around the row; a horizontal scroll interaction (drag/trackpad/scrollbar) reveals the remaining tabs.

2. **Cross-page coverage (FR-005)**
   - Spot-check at least 3–4 of the other pages that reuse `components/ui/SubTabs.tsx` (see list gathered during planning — e.g., an Order's Fulfillment tab, a Quote's Returns tab, a Purchase Order's Returns tab, a Supplier Bill's Payments tab, a Proposal line's Fulfillments tab).
   - **Expected**: same single-line, horizontally-scrollable behavior; no vertical scrollbar artifact on any of them.

3. **No-overflow case (edge case)**
   - Find or simulate a sub-tab row with few enough tabs that they always fit, even at the narrowest tested width.
   - **Expected**: no scroll affordance of any kind; row renders as a plain single line.

4. **Row height stability**
   - On a page from Scenario 1, resize the viewport across the point where the row transitions from "all tabs fit" to "tabs overflow and scroll."
   - **Expected**: the row's height does not visibly change at that transition (no jump/reflow of the page content below it).

## Expected Outcome

All four scenarios pass with zero instances of a vertical scrollbar or two-line appearance in the sub-tab row, consistent with spec success criteria SC-001–SC-003.
