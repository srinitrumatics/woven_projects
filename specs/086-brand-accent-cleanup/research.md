# Phase 0 Research: Brand Accent Color Cleanup

No `[NEEDS CLARIFICATION]` markers remain. This phase documents the direct code investigation that grounded the plan, including two "bonus" discoveries adjacent to the originally-scoped findings, and the exact established `primary`-token patterns copied from already-correct sibling files.

## 0. Brand color reference

`tailwind.config.ts:19-23`: `primary.DEFAULT = #96C2DB`, `primary.light = #E5EDF1`, `primary.dark = #6B9DB8`. Established usage conventions found across already-correct files (used as the copy-source templates below):
- Buttons: `bg-primary text-white hover:bg-primary/90` (or `hover:bg-primary-dark`, both seen; `hover:bg-primary/90` is more common in the specific sibling files copied for User Story 4).
- Inputs/focus states: `focus:ring-2 focus:ring-primary` or `focus:border-primary`.
- Active/selected state: `bg-primary text-white shadow-sm`.
- Icon bubble + glyph pair: `bg-primary/10 dark:bg-primary/20` container with a `text-primary` icon (seen in `OrderHeader.tsx` post-`084` fix).
- Gradient accents (e.g. stat-card top bars): `bg-gradient-to-r from-primary to-primary-dark` (`app/orders/page.tsx:605`).
- Light backgrounds: `bg-primary-light` / `bg-primary/10`.

## 1. Search page (`app/search/SearchClientPage.tsx`)

**Decision**: Replace all 13 `indigo-*` occurrences (lines 74, 82, 86, 104, 117, 128, 202, 247, 265, 288, 291, 316, 319) with `primary`/`primary-dark`/`primary-light`/`primary/10`-family equivalents, preserving each element's existing shape/weight/spacing classes exactly — color only.

**Bonus discovery**: The search input itself (line 234) uses `focus:ring-2 focus:ring-blue-500 focus:border-blue-500` — a *third* off-brand color (generic Tailwind blue, not indigo) on the same page, matching the original audit's separately-flagged "focus ring, 3rd blue on one page" finding. Included in User Story 1's scope since it's the same page, same "this page should just use `primary`" fix, not a separate story.

**Mapping**: `indigo-600`→`primary`, `indigo-400`(dark)→`primary` (dark mode already handled by the token), `indigo-700`(hover)→`primary-dark`, `indigo-100`/`indigo-900`(badge bg)→`primary/10`/`primary/20`, `indigo-800`/`indigo-300`(badge text, dark)→`primary`/`primary-light`, `indigo-500`(focus ring)→`primary`. `blue-500`(input focus)→`primary`.

## 2. Configure page — "+Add Group" and adjacent group-row/subtotal styling (`app/configure/ConfigureOrderClientPage.tsx`)

**Decision**: Replace the 6 purple occurrences (lines 693, 729, 760, 761, 841, 852) with `primary` equivalents. Additionally fold in 2 adjacent indigo occurrences discovered during investigation (not in the original scope description, but directly part of the same "line group" feature):
- Line 834: group-row background/hover/selected states (`bg-indigo-50/50`, `hover:bg-indigo-50`, `bg-indigo-100/50` when selected) → `bg-primary/5`, `hover:bg-primary/10`, `bg-primary/10` (selected).
- Line 846: group subtotal figure text color (`text-indigo-600 dark:text-indigo-400`) → `text-primary`.

**Rationale for the addition**: These 2 lines color the visual result of using the "+Add Group" feature (the grouped rows themselves and their subtotal) — the exact same feature area as the button being fixed, just a different color (indigo instead of purple) for a closely related part of the same UI. Leaving them indigo while making the button itself `primary` would replace one inconsistency (purple vs. primary) with another (primary button, indigo results) rather than actually completing the fix.

**`lvColors` array (line 852)**: `['bg-gray-200 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700']` is a categorical color set for line-group nesting depth (gray/blue/green/purple for levels 1-4). Replace `'bg-purple-100 text-purple-700'` with `'bg-primary/20 text-primary-dark'` — stays visually distinct from the other 3 entries (gray, blue, green) already in the array, and uses the brand token instead of an arbitrary 4th hue.

## 3. Admin Organizations page + Admin Dashboard tile

**Decision**: Re-theme `app/admin/organizations/page.tsx` (24 orange/amber lines + 2 indigo + 1 purple = every off-brand color in the file) onto `primary`, and `app/admin/page.tsx`'s Organizations tile icon (2 lines) onto the established `bg-primary/10`/`text-primary` icon-bubble pattern.

**Investigation**: `app/admin/organizations/page.tsx` (706 lines) has **zero** existing uses of `primary` — every accent is orange/amber (page background gradient, header icon container, 2 primary-action buttons, a modal header bar, 9 form-input focus rings, a section-header background, a row-hover state, row icons, an active-tab state, and a 3-part empty-state), plus 2 indigo action buttons (lines 387, 557) and 1 purple mono-badge (line 520). The sibling page `app/admin/authorize-locations/page.tsx` already correctly uses `primary` 10 times (buttons, focus rings, active tabs, icons, hover states) — used as the direct copy-source for every mapping below. `app/admin/page.tsx`'s Organizations tile (lines 20-21) is the only tile on that page (no siblings within the file to compare against, contrary to the original scope description's assumption) — mapped instead to the app-wide `bg-primary/10 dark:bg-primary/20` + `text-primary` icon-bubble convention used elsewhere (e.g. `OrderHeader.tsx`).

**Mapping**: `orange-500`/`amber-600` (gradients) → `primary`/`primary-dark` (same gradient direction, e.g. `bg-gradient-to-br from-primary to-primary-dark`); `orange-500` (focus rings) → `primary`; `orange-50`/`amber-50` (section bg) → `primary-light`/`primary/10`; `orange-600` (icon/text) → `primary`; `indigo-300`/`indigo-700`/`indigo-50` (action buttons) → `primary`-equivalent outline-button styling matching `authorize-locations`'s own secondary-button convention; `purple-50`/`purple-700`/`purple-200` (mono badge, line 520) → `blue-50`/`blue-700`/`blue-200` — discovered during implementation that this badge's immediate sibling 2 lines above (the `algoliaSchema` badge, line 514) already uses exactly this blue treatment for the same kind of monospace identifier chip; matching the two adjacent chips to each other is a stronger, more internally-consistent signal than the originally-planned "neutral gray," and avoids introducing a 3rd treatment for what's visually one pair of sibling badges. Neither this file's pre-existing blue badge nor the newly-matched one is in this feature's `primary`-conversion scope (blue was never a confirmed off-brand finding here) — only the purple one was.

**Alternatives considered**: Leaving the purple mono-badge as purple since it's arguably closer to "categorical" than "brand accent" — rejected; unlike the file-type icons or StatusBadge's semantic system (which have many distinct values needing many distinct colors), this file has exactly one such badge with no categorical siblings, so it reads as leftover drift rather than a deliberate color code. A neutral gray badge (the original plan) — superseded during implementation once the adjacent blue sibling badge was noticed; matching the sibling is more consistent than introducing a 3rd, unrelated neutral tone.

## 4. Line-detail "Back" buttons — 4 broken, 4 correct templates confirmed

**Decision**: In each of the 4 broken files, replace `bg-[#A7C7E7] text-white rounded shadow-sm hover:bg-[#8FB8DE] transition-colors text-sm` with `bg-primary text-white rounded shadow-sm hover:bg-primary/90 transition-colors text-sm` — color classes only, preserving each file's exact shape/spacing/font-weight classes untouched (`app/admin/authorize-locations/[id]/delivery-windows/page.tsx` additionally has trailing `font-medium whitespace-nowrap`, kept as-is).

**Confirmed byte-identical broken pattern** across all 4: `app/invoices/[id]/lines/[lineid]/page.tsx:236`, `app/shipments/[id]/lines/[lineid]/page.tsx:190`, `app/quotes/[id]/lines/[lineid]/page.tsx:358`, `app/admin/authorize-locations/[id]/delivery-windows/page.tsx:250`.

**Confirmed correct sibling templates copied from**: `app/orders/[id]/lines/[lineId]/page.tsx:371` (`bg-primary text-white rounded-lg hover:bg-primary-dark`), `app/purchase-orders/[id]/lines/[lineid]/page.tsx` (`bg-primary text-white rounded-lg hover:bg-primary/90`), `app/supplier-bills/[id]/lines/[lineid]/page.tsx:210` (`bg-primary text-white rounded-lg hover:bg-primary/90`) — `hover:bg-primary/90` is the more common convention among these three, used as the target.

## 5. Product Gallery hex literals (`app/products/[id]/components/ProductGallery.tsx`)

**Decision**: Line 59's `bg-[#E8F1FC]` (main image-display panel, a very light blue close to `primary-light`'s `#E5EDF1`) → `bg-primary-light`. Line 71's `bg-[#9BB8F4]` ("No Image" placeholder icon box, a more saturated blue) → `bg-primary/40`, chosen to remain visually distinct from the lighter panel background around it (matching the current design's two-tone light/medium relationship) while using the brand token family.

**Scope note**: The adjacent `border-blue-50`/`border-blue-200` classes on these same 2 lines are generic Tailwind blue borders, not hardcoded hex literals — FR-007 is scoped specifically to the 2 confirmed hex *backgrounds*; the borders are a smaller, separate drift not named in this feature's scope and left untouched to keep the diff minimal.

## 6. Explicitly confirmed out of scope (verified during research, not touched)

- `app/(admin-portal)/*` (including `admin-login`'s indigo Sign In button) — per explicit user decision, an intentionally independent internal-tool system.
- `components/ui/StatusBadge.tsx`'s purple (`sent`/`under review`) and indigo (`negotiation`/`viewed`) cases — 2 of ~13 deliberate semantic status colors; touching these would break the status-color system this app relies on everywhere.
- `app/(admin-portal)/admin-portal/organizations/[id]/page.tsx` and `.../create/page.tsx` — their indigo/purple/emerald colors are a deliberate sequential "Load → Index → Launch" step color code; both files already correctly use `bg-primary` extensively for their actual primary CTAs (submit buttons, step-progress circles, focus rings), confirming the step-colors are an intentional, separate categorical code, not drift.
- `app/home/page.tsx`'s purple "Pending Quotes"/"View Quotes" tiles — part of a consistent categorical per-section quick-action tile scheme (blue=Orders, green=Proposals, purple=Quotes, orange=Shipments, red=Invoices).
- File-type icon colors (purple=image, amber=ZIP) across `POFilesTable.tsx`, `SupplierBillFilesTable.tsx`, `SBLFilesTab.tsx`, `FilesTab.tsx`, `QuoteFilesTab.tsx` — a deliberate document-type color convention.
- `EditProductTabs.tsx`'s orange "EOL" status badge, `Toast.tsx`'s amber warning/confirm styling, and orange/amber "pending"/"outstanding" stat-tab colors across several list pages — legitimate semantic status/warning indicators.
- Icon-container color-pairing mismatches in `KeyDates.tsx`, `ProposalDetails.tsx`, `PODetails.tsx` — a different class of defect (icon/bubble pairing, not brand-accent drift), deferred to a possible future "Cards" consistency spec.
