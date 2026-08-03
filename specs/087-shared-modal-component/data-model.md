# Data Model: Shared Accessible Modal Component

No database, API, or Salesforce data changes. This is a new frontend component plus a new dependency, and 8 call-site migrations.

## `components/ui/Modal.tsx` — proposed API

```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;              // rendered in the header; also used as the accessible dialog name (Radix Dialog.Title)
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';  // maps to max-w-lg / max-w-xl / max-w-2xl / max-w-3xl / max-w-5xl
  children: React.ReactNode;   // body content
  footer?: React.ReactNode;    // optional footer/action-button slot
  hideHeader?: boolean;        // for AddProductModal's existing "hide header in some contexts" need — only affects the non-inline branch
}
```

- `size` mapping covers every current `max-w-*` value found in the 8 modals: `sm`→`max-w-lg` (AddToOrderModal, CertificationModal, DatasheetModal, ProductCatalog popup), `lg`→`max-w-xl` (DeliveryWindowModal), `xl`→`max-w-2xl` (LocationModal), `2xl`→`max-w-3xl` (TrackingTimelineModal), a larger size→`max-w-5xl` (AddProductModal).
- `title` populates both the visible header text and Radix's `Dialog.Title` (satisfies FR-004's "announced with title" requirement) — every modal already has a clear title/heading today, so this is a direct carry-over, not a new requirement on callers.
- `footer` replaces each modal's own hand-rolled `<div className="... flex justify-end gap-3">{Cancel}{Save}</div>` footer block — callers pass their existing Cancel/Save (or single Close) buttons as this slot's content, unstyled by the Modal itself beyond the container/border it sits in.
- No `onOpenAutoFocus`/`onCloseAutoFocus` overrides are exposed initially — Radix's sensible defaults (focus first focusable element on open, return focus to trigger on close) are used app-wide, consistent with FR-003 requiring this uniformly.

## Per-modal migration mapping

| File | Current shell removed | New usage |
|---|---|---|
| `app/products/components/AddProductModal.tsx` | Own `fixed inset-0 z-[60] ...` overlay + header/close-button + footer border div (non-inline branch only) | `<Modal isOpen={isOpen} onClose={onClose} title={isEditingMode ? "Edit Product" : "Create Product"} size="5xl-equivalent" footer={...}>{form body}</Modal>`; `inlineMode` branch unchanged |
| `app/products/[id]/components/AddToOrderModal.tsx` | Own overlay + header + footer | `<Modal isOpen={isOpen} onClose={onClose} title="Add to Order" size="sm" footer={...}>` |
| `app/products/[id]/components/CertificationModal.tsx` | Own overlay + header + footer; **gains `isOpen` prop** | `<Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Certification" : "Add Certification"} size="sm" footer={...}>` |
| `app/products/[id]/components/DatasheetModal.tsx` | Own overlay + header + footer; **gains `isOpen` prop** | `<Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Datasheet" : "Add Datasheet"} size="sm" footer={...}>` |
| `app/admin/authorize-locations/components/LocationModal.tsx` | Own overlay + header (dynamic by mode) + footer; existing click-outside removed (now provided by shared Modal) | `<Modal isOpen={isOpen} onClose={onClose} title={dynamic by mode} size="xl" footer={...}>` |
| `app/admin/authorize-locations/[id]/delivery-windows/components/DeliveryWindowModal.tsx` | Own overlay + header + footer + dead `animate-in` classes | `<Modal isOpen={isOpen} onClose={onClose} title={title prop} size="lg" footer={...}>` |
| `app/shipments/[id]/components/TrackingTimelineModal.tsx` | Own overlay + header + single Close footer; existing click-outside removed (now provided by shared Modal) | `<Modal isOpen={isOpen} onClose={onClose} title="Tracking Timeline" size="2xl" footer={<Close button>}>` — content/data logic untouched |
| `app/orders/[id]/components/ProductCatalog.tsx` (inline popup) | Own overlay + header + close button; existing click-outside removed (now provided by shared Modal) | `<Modal isOpen={!!popupProduct} onClose={handleClosePopup} title={popupProduct?.name} size="sm">{image}</Modal>` — no footer (display-only) |

## Call-site changes beyond the modal files themselves

| File | Change |
|---|---|
| `app/products/[id]/components/EditProductTabs.tsx` | `{isCertModalOpen && <CertificationModal .../>}` → `<CertificationModal isOpen={isCertModalOpen} .../>` (always mounted); same for `DatasheetModal`/`isDatasheetModalOpen` |

## Removed per-modal (superseded by the shared component)

- Every modal's own `if (!isOpen) return null;` early return (research.md §3) — replaced by always rendering and passing `isOpen` to `<Modal>`.
- Every modal's own backdrop div (`fixed inset-0 ... bg-black/50 backdrop-blur-sm`).
- Every modal's own container radius/shadow/max-width/z-index classes.
- Every modal's own inline `<svg>` close-icon button.
- `DeliveryWindowModal.tsx`'s dead `animate-in fade-in`/`zoom-in-95` classes.
- The 3 pre-existing hand-rolled click-outside implementations (`LocationModal`, `TrackingTimelineModal`, `ProductCatalog` popup) — superseded by the shared component providing this uniformly for all 8 (FR-006).
