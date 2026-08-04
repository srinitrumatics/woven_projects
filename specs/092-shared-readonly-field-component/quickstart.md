# Quickstart: Shared Read-Only Field Component

Manual/visual verification, consistent with `077`-`091` (no automated UI test suite exists in this repo). Run `npm run dev` and log in with a live Salesforce-connected session.

## Scenario 1 — Broken Invoice links now work (US1, P1)

1. Open an Invoice Detail page (`/invoices/[id]`) for an invoice with a resolvable Account, Bill/Ship-To Location, Proposal, Customer Order, Sales Order, and Purchase Order.
2. In Billing Information: click **"Bill to Account"** and **"Bill to Location"** → expect navigation to `/accounts/[id]` and `/locations/[id]` respectively.
3. In Shipping Information: click **"Ship to Account"**, **"Ship to Location"**, and **"Site"** → expect navigation to the correct related record.
4. In the Key Dates/Card Detail section: click **"Proposal Name"**, **"Customer Order"**, **"Sales Order"**, **"Purchase Order"** → expect navigation to `/proposals/[id]`, `/orders/[id]` (×2), `/purchase-orders/[id]` respectively.
5. For any field where the underlying id is not resolvable, confirm it renders as plain text — no broken/empty link.

## Scenario 2 — One consistent read-only field style everywhere (US2, P1)

1. Open an Invoice Detail page → Billing/Shipping/Card-Detail sections. Confirm no field has a focus ring, press-animation, or input-like cursor.
2. Open a Proposal Detail page → Billing Information, Shipping Information, Key Dates. Confirm identical styling to Invoice's fields (same border, background, radius, text size).
3. Open a Quote Detail page → Billing Information (previously uniquely grayed-out/`cursor-not-allowed`), Shipping Information, Key Dates. Confirm Quote Billing Information no longer looks visually distinct from Quote Shipping Information or from Invoice/Proposal's equivalent cards.
4. Open Invoice, Proposal, and Quote Line Detail pages' Product Information cards. Confirm all 3 render identically to each other.
5. Open an Order Line Detail page's Product Information card. Confirm it now matches the same shared styling as the other 3 modules' Line Detail Product Information cards.
6. Open an Order Detail page's Billing Information / Shipping Information / Notes sections. Click into edit mode if available. Confirm 100% unchanged behavior — real editable fields, `onChange` still works, nothing from this feature touched them.
7. Confirm the Proposal and Quote "Drop-Ship" field still shows green/bold text when its value is "Yes" (the one `valueClassName` case).

## Scenario 3 — Notes/Scope Summary boxes are consistent (US3, P2)

1. Open an Invoice Detail page's Notes section, a Proposal Detail page's Notes and Scope Summary sections, and a Quote Detail page's Notes section. Confirm all render with the same shared box styling.
2. Open Invoice, Proposal, and Quote Line Detail pages and check each one's Notes box. Confirm all 3 now show full multi-line note text (not truncated to a single line as before), matching the top-level Notes cards' styling.

## Final checks

- `grep -rn "DetailInput" app/invoices` → expect zero results (component deleted, all 3 call sites migrated).
- `npx tsc --noEmit` — no new type errors introduced.
- No console errors in the browser dev console across all 3 scenarios.
- `git diff --stat` touches only the files listed in `plan.md`'s Project Structure — no business logic, data-fetching, or Salesforce query changes anywhere in the diff.
