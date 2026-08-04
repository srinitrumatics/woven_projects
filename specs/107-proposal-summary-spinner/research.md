# Research: Proposal Summary Spinner Consolidation

## Decision: Map the 40px spinner to `LoadingSpinner size="md"` (48px), not `size="sm"` (32px)

**Rationale**: The spinner in `app/proposals/[id]/summary/page.tsx` is `w-10 h-10` (40px) — numerically equidistant between `LoadingSpinner`'s two sizes established in spec 106 (`sm` = 32px, `md` = 48px). Pixel distance alone cannot break the tie, so the decision is made on the same semantic axis spec 106 used to define its two buckets:

- **Bucket A (`size="md"`)**: "this whole page/panel's content is loading" — a large, dedicated content area with no other content rendered alongside it while loading.
- **Bucket B (`size="sm"`)**: "this nested tab-panel's content is loading" — a small loading state inside an already-loaded page, alongside other rendered chrome (tabs, headers, other cards).

The Proposal Summary spinner sits inside a dedicated `h-[calc(100vh-200px)]` container that holds nothing but the loading state or (once ready) the full-height embedded workspace iframe — structurally identical in role to Bucket A's full-page/full-panel spinners (e.g. `app/orders/[id]/lines/[lineId]/page.tsx`'s `text="Loading order line details..."`, `app/shipments/[id]/page.tsx`'s `text="Loading shipment details..."`), not to Bucket B's compact in-page tab spinners (e.g. certification lists, fulfillment tables rendered within an already-visible page).

**Alternatives considered**:
- **`size="sm"` (32px)**: Rejected — would make the loading state look disproportionately small relative to the large panel it occupies, and would misclassify this as a Bucket B "nested tab content" pattern when it structurally is not (nothing else is rendered in that panel while loading).
- **Introduce a 3rd size to `LoadingSpinner` (e.g. `size="md-sm"` at 40px)**: Rejected — over-engineering for a single call site; violates Simplicity/YAGNI. Unlike spec 106's redefinition of `size="sm"` (which was safe because it had zero prior call sites), `size="md"` and `size="sm"` are now both in active use across 26 files; changing either again would require re-touching all of them. A single call site does not justify a 3rd size tier.
- **Leave as a one-off hand-rolled spinner**: Rejected — this is precisely the inconsistency the audit is closing out; leaving it unaddressed keeps the tracker's one remaining open item open indefinitely.

## Decision: Preserve the existing "Loading workspace..." caption via `LoadingSpinner`'s `text` prop

**Rationale**: `LoadingSpinner` already supports an optional `text` prop rendered below the spinner in its own internal flex-column layout (used by 15 of the 16 Bucket A migrations in spec 106 with a `text="Loading ... details..."` pattern). Passing `text="Loading workspace..."` preserves the exact same caption content and visual stacking the page already has today, while letting `LoadingSpinner` own the centering/spacing instead of the page's own now-redundant `flex flex-col items-center gap-3` wrapper.
