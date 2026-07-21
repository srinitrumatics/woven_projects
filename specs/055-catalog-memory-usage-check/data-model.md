# Data Model: Browser Memory Usage Report for Product Loading

No database, Salesforce, or application data model changes are introduced by this feature.
This document describes the shape of the two entities the spec (`spec.md`) defines, purely
as structured data the measurement script produces and the final document presents — neither
is persisted anywhere beyond the deliverable markdown file.

## Entity: Memory Checkpoint Measurement

One row per (page × checkpoint) combination — 6 total (2 pages × 3 checkpoints).

| Field | Type | Description |
|-------|------|--------------|
| `page` | `'Products Catalog' \| 'Order Details — Add Products tab'` | Which of the two pages this measurement is for (spec FR-003) |
| `checkpoint` | `'baseline' \| '~1,000 products' \| '~2,000 products'` | Which target checkpoint this measurement represents (spec FR-001/FR-002) |
| `actualCount` | `number` | The actual product count reached, which may differ from the checkpoint's nominal target (spec FR-004, Edge Cases) |
| `jsHeapUsedBytes` | `number` | Chrome's JS heap used size at the moment of measurement, per `page.metrics().JSHeapUsedSize` (see `research.md` Decision 1) |
| `method` | `'real catalog' \| 'simulated/truncated catalog'` | Whether this checkpoint was reached against the account's real product data or a response-truncated simulation (relevant only for the Add Products tab, per `research.md` Decision 3) |
| `notes` | `string` (optional) | Any caveat specific to this measurement (e.g., "tab loads all-at-once; this is the single post-load reading") |

### Invariants

- Exactly 3 `checkpoint` rows exist per `page` (baseline, ~1,000, ~2,000) — 6 rows total (spec SC-001).
- `actualCount` for a `~1,000 products`/`~2,000 products` checkpoint is always the true rendered/fetched count at measurement time, never silently rounded to the nominal target (spec FR-004).
- No row is fabricated if a measurement could not be taken — per the spec's Edge Cases, an unmeasurable checkpoint is stated as a limitation in the document rather than given an invented number.

## Entity: Memory Usage Document

The single markdown deliverable (`specs/055-catalog-memory-usage-check/memory-usage-report.md`)
containing all 6 Memory Checkpoint Measurement rows plus a summary judgment.

| Field | Type | Description |
|-------|------|--------------|
| `measurements` | `MemoryCheckpointMeasurement[]` | All 6 rows, grouped by page |
| `methodologyNote` | `string` | States the measurement tool (Chrome via `page.metrics()`) and, for the Add Products tab, whether truncation/simulation was used (spec Assumptions) |
| `summaryJudgment` | `'concerning' \| 'not concerning' \| 'uncertain'` with reasoning | Plain-language verdict per page on whether memory growth looks like a scaling concern (spec FR-007, SC-003) |

### Invariants

- Every one of the 6 measurements is present and attributable to a specific page and checkpoint (spec SC-001, SC-002).
- The summary judgment is stated for **each** page independently — a single combined verdict is not sufficient, since the two pages have different loading architectures (per `research.md` Decisions 2-3) and could reasonably have different verdicts.
