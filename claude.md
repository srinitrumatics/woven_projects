# WOVN Client & Partner Web-Application (Stateless)
_Design & Development Specification_

## 1. Overview
This document defines a **modern, responsive, stateless** web-application that allows three types of users to interact with the **WOVN (Salesforce-based) backend**:

1. **Client** – buys products/services.
2. **Partner** – offers services, manages supplier-side objects.
3. **Client-Partner** – can do both.

The web-app is a **presentation and orchestration layer only**. It will **not persist business data**. All records (Accounts, Products, Orders, Quotes, Invoices, etc.) are stored and governed in **WOVN** and accessed via **secured APIs**.

The app should be:
- **Performant** (1,000–2,000 concurrent users)
- **Responsive** (desktop, tablet, mobile)
- **Accessible** (WCAG 2.1 AA-minded)
- **Secure** (OAuth2/OIDC, tenant isolation, least privilege)
- **Scalable** (horizontal scaling, stateless services, CDN-backed assets)
- **Extensible** (role-based feature surface area; future marketplaces)

---

## 2. Architecture at a Glance

**Front-End (Stateless)**
- SPA / metaframework: **Next.js 15+ (React)** or **Nuxt 3 (Vue)**
- UI: **Tailwind CSS** + **Headless UI / Radix UI** for accessibility
- State mgmt: **React Query / TanStack Query** for data fetching & caching
- Forms: **React Hook Form + Zod** for schema validation
- The web app **never** writes directly to a database – it **calls APIs**.

**API / BFF (Backend for Frontend)**
- Node.js (Fastify / NestJS) or Go-based thin API layer
- Responsible for:
  - AuthN/AuthZ (OIDC with WOVN / Salesforce / external IdP)
  - Request shaping and pagination
  - Per-account data scoping
  - Rate limiting & caching (Redis)
  - Mapping web requests → WOVN objects

**Source of Truth**
- **WOVN (Salesforce)**
  - All objects listed in the requirements are mastered here.
  - Web-app reads/writes through secured API integration.
  - Audit, ownership, approvals, pricing, tax → in WOVN.

**Statelessness**
- Session = **token-based** (JWT/OIDC, short-lived access token + refresh token rotation).
- UI state stored in-memory (browser) or localStorage only for **non-sensitive** prefs (theme, column widths, last filters).

**Performance & Scale**
- CDN for static assets (images, JS chunks, fonts)
- API gateway (Apigee / Kong / AWS API Gateway) in front of BFF
- Caching layer for:
  - Product Catalog
  - Price Books
  - Inventory Positions (read-optimized, short TTL)
- Observability (OpenTelemetry, structured logs, tracing)

---

## 3. User Types & Capabilities

### 3.1 Account Types
1. **Client**
   - Purchase Products and Services
   - Create Customer Orders
   - View commercial docs (Proposals, Quotes, Orders, Invoices)
   - Pay online
2. **Partner**
   - Offer Services
   - Create Products (Partner-sourced)
   - View Purchase / Supplier-side docs
3. **Client-Partner**
   - Union of **Client** + **Partner** abilities

### 3.2 Client Abilities
- Create **New Users** under their account (role-based within the tenant)
- Edit **Account** details (within allowed fields)
- Edit **Contact** details
- **Create Customer Orders**
- View:
  - Products
  - Inventory
  - Proposals
  - Customer Quotes
  - Sales Orders
  - Invoices
  - Receive Payments
  - Credit Memos
  - RMAs
  - Shipping Manifests
- **View & Download** Reports / Dashboards
- **Pay immediately** (checkout) **or** against payment terms

### 3.3 Partner Abilities
- Create **New Users** under their account
- Edit **Account** details
- Edit **Contact** details
- **Create Products** (service SKUs / labor SKUs / regional SKUs)
- View:
  - Products
  - Purchase Orders
  - Supplier Bills
  - Debit Memos
  - Bill Payments
  - RTVs
- **View & Download** Reports / Dashboards

---

## 4. Pages & UX Layout

> Goal: **Slick, modern, card-first, table-enhanced UI** using responsive flex/grid. All lists should support: search, filter, sort, paginate, export.

### 4.1 Public / Anonymous
- **Landing Page**
  - Hero: "WOVN Client Portal"
  - Features by role (Client / Partner / Client-Partner)
  - CTA: Sign Up / Sign In
  - Status indicator (if we expose service status)
- **Sign In**
  - OIDC / OAuth2
  - Social / SSO (optional)
  - MFA challenge (TOTP / SMS / Email OTP)
- **Sign Up (Self-Service)**
  - Email + company + role selection
  - Optional "I am a Partner"
  - Onboarding workflow → creates **Contact** and **Account-Contact Relationship** in WOVN via API
  - Email verification

### 4.2 Authenticated Shell
- **Top Nav**: logo, org selector (for Client-Partner), notifications, profile, dark mode toggle
- **Left Nav (Collapsible)**: role-aware menu
  - Dashboard
  - Products
  - Orders
  - Quotes
  - Invoices
  - Inventory
  - Supplier (for Partner)
  - Reports
  - Admin (User Mgmt)

### 4.3 Dashboards
- Card layout:
  - "Open Customer Orders"
  - "Pending Invoices"
  - "Available Inventory"
  - "Recent Quotes"
  - "POs Pending Receipt" (Partner)
- Charts (client-side, lazy loaded): Recharts / ECharts
- Export to CSV/PDF (generated on BFF to avoid exposing WOVN secrets)

### 4.4 Product Catalog (All Roles)
- **View Products**
  - Header filters: Category, Family, Status, Price Book
  - Table with sticky header, pinned columns
  - Product card view (for mobile)
  - Quick view (drawer): description, images, price, availability, related services
- **Add to Order** (Client & Client-Partner)
  - Opens side drawer "Build Order"
  - Stateless cart (in-memory) until **Submit to WOVN**
  - Price Book / Account-based pricing → via API call
- **For Partner**: "Create Product" button → form → API → WOVN

### 4.5 Customer Orders (Client / Client-Partner)
- **List View**: latest orders at top, status chips (Draft, Submitted, In Fulfillment, Shipped, Closed)
- **Create Customer Order**:
  1. Select Account (if multiple) / Authorized Location
  2. Add Lines from Product Catalog
  3. Confirm pricing & taxes (API → WOVN)
  4. Submit → API call → WOVN creates **Customer Order** + **Customer Order Lines**
- **Order Detail Page**
  - Header: status, total, created by, location
  - Tabs:
    - Lines
    - Shipments (Shipping Manifests)
    - Invoices
    - Activity
  - Actions:
    - "Recalculate from WOVN"
    - "Download as PDF"
    - "Pay Now"

### 4.6 Quotes / Proposals
- View **Proposals** and **Proposed Products**
- View **Customer Quotes** and **Customer Quote Lines**
- Convert Quote → Order (via API)
- Surface WOVN approvals / status

### 4.7 Invoices & Payments
- Invoices list (filter by date, status, balance)
- Invoice detail:
  - Lines
  - Related Sales Order / Shipments
  - Related Payments
- **Pay Now** (Stripe / Adyen / PayPal / Braintree)
  - Multi-tender: Card, ACH, Wallet
  - Post payment → call WOVN **Receive Payments**
  - Store only tokens, not raw card data (PCI-minded)

### 4.8 Partner / Supplier Views
- **Purchase Orders and Purchase Order Lines**
- **Supplier Bills and Supplier Bill Lines**
- **Bill Payments**
- **Debit Memos and Debit Memo Lines**
- **RTVs and RTV Lines**
- All read directly from WOVN via role-scoped APIs.

### 4.9 Reports & Dashboards
- Report list (role-based)
- Download:
  - CSV (client)
  - PDF (server/BFF-generated)
- Optional: embed Salesforce Analytics / Tableau / CRM Analytics

---

## 5. Data & API Surface

The web-app must have API access (via BFF) to these **WOVN objects**:

- Accounts
- Authorized Locations
- Contacts
- Account Contact Relationship
- Products
- Price Books and Price Book Entries
- Customer Orders and Customer Order Lines
- Proposals and Proposed Products
- Customer Quotes and Customer Quote Lines
- Purchase Orders and Purchase Order Lines
- Supplier Bills and Supplier Bill Lines
- Bill Payments
- RTVs and RTV Lines
- Debit Memos and Debit Memo Lines
- Sales Orders and Sales Order Lines
- Invoices and Invoices Lines
- Receive Payments
- Credit Memos and Credit Memo Lines
- RMAs and RMA Lines
- Shipping Manifests and Shipping Manifest Lines
- Inventory Positions

**Best Practice:** wrap these in **versioned REST endpoints** (e.g. `/v1/products`, `/v1/customer-orders`) or **GraphQL** with fine-grained permissions.

---

## 6. Authentication, Authorization & Security

- **Auth Protocol**: OAuth2 / OIDC, short-lived access tokens
- **User Store**: managed in WOVN (Contacts + Account-Contact Relationship)
- **Account Scoping**: every request carries `accountId` and `role` → BFF validates against WOVN
- **RBAC**:
  - Roles: `client`, `partner`, `client-partner`, `admin`
  - Policies applied at route + object + field level
- **MFA / Step-Up** for payments and user administration
- **Tenant Isolation**: user can **only** see:
  - their Account
  - their Authorized Locations
  - objects owned-by / shared-to their Account
- **API Protection**:
  - Rate limiting (per IP + per account)
  - WAF rules
  - Signed requests to Salesforce/WOVN
  - Secrets in Vault (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault)
- **No PII in logs**

---

## 7. Performance & Scalability Considerations

1. **Concurrency**: 1,000–2,000 concurrent users
   - Use **SSR/ISR** (Next.js) for public pages
   - Client-side hydration for authenticated pages
   - Lazy-load data tables, infinite scroll for catalogs
2. **Caching**:
   - Edge caching for static assets
   - API responses for **Products**, **Price Books**, and **Inventory Positions** with short TTL (15–60s)
3. **Pagination & Virtualization**:
   - Large tables → server-side pagination
   - React-window / TanStack Virtual for long lists
4. **Batching**:
   - BFF should batch & fan-out to WOVN, then return a single payload
5. **Image Optimization**:
   - Next.js Image / CDN image resizing

---

## 8. Accessibility & UI/UX Standards

- WCAG 2.1 AA-aligned: focus rings, ARIA roles, keyboard nav
- High-contrast mode and dark mode toggle
- Form validation inline, concise errors
- Toast notifications for API operations
- Mobile-first, then scale up grid to desktop

---

## 9. Development Phases

### Phase 0 – Foundations
- Choose tech stack: **Next.js + Tailwind + TanStack Query + Node/Nest BFF**
- Set up CI/CD (GitHub Actions / GitLab / Azure DevOps)
- Set up environment management (dev, test, stage, prod)
- Connect to **WOVN sandbox** via secure creds
- Setup Auth (OIDC) and RBAC scaffold

### Phase 1 – **Client** Priority
1. Auth flows (Sign Up, Sign In, Forgot Password, Verify Email)
2. Account & Contact profile pages
3. Product Catalog (search, filter, detail drawer)
4. Create **Customer Order** (cart → submit → WOVN)
5. View:
   - Customer Orders
   - Proposals
   - Customer Quotes
   - Invoices
   - Shipping Manifests
6. **Pay Now** integration
7. Reports/Dashboards (view/download)
8. Client self-user-management (create users under account)

### Phase 2 – **Partner** Priority
1. Partner dashboard
2. Create Products (service SKUs)
3. View:
   - Purchase Orders
   - Supplier Bills
   - Debit Memos
   - Bill Payments
   - RTVs
4. Reports & downloads

### Phase 3 – **Client-Partner** (Hybrid)
- Role unification: single login, role-switch in UI
- Combined dashboard widgets
- Combined reporting
- Cross-object search

### Phase 4 – Hardening & Scale
- Performance testing (k6 / Gatling)
- Security testing (SAST/DAST)
- Auditing & monitoring (Grafana, Prometheus, OpenTelemetry)
- Feature flags (LaunchDarkly / GrowthBook)

---

## 10. Recommended Technologies & Tools

**Frontend**
- Next.js 15+ / React 19
- Tailwind CSS, Headless UI / Radix UI
- TanStack Query, React Hook Form + Zod

**Backend / BFF**
- Node.js (NestJS / Fastify)
- JWT / OIDC
- Redis (caching, rate limit)
- API Gateway (Kong / Apigee / AWS API Gateway)

**Build & DevOps**
- GitHub Actions (CI)
- Docker + K8s (GKE/EKS/AKS)
- Sentry / New Relic / Datadog

**Testing**
- Vitest / Jest
- Playwright / Cypress (E2E)
- k6 (perf)

**Security**
- OWASP ASVS baseline
- Snyk / Dependabot

---

## 11. Gaps & Best Practices

1. **API Contract First**
   - Define OpenAPI/Swagger for all WOVN-endpoint proxies.
   - Version your API (`/v1/`, `/v2/`).

2. **Offline / Draft Orders**
   - Because app is stateless, drafts must be kept either:
     - in browser storage, or
     - in WOVN as "Draft Customer Order"
   - **Recommendation**: create a **Draft** object/state in WOVN so users can resume across devices.

3. **File/Report Download Security**
   - Signed URLs, time-bound
   - Watermark PDFs with account ID

4. **Payments**
   - Use a PSP that supports webhooks → update WOVN **Receive Payments** automatically.

5. **Field-Level Security (FLS)**
   - Enforce at BFF so UI doesn't have to know Salesforce profiles.

6. **Multi-Tenancy**
   - Always pass `accountId` in token or session claims
   - Validate against WOVN on every request

---

## 12. Sample Navigation Structure

```text
- Dashboard
- Products
  - Catalog
  - My Products (Partner)
- Orders
  - Customer Orders
  - Sales Orders
  - Shipping Manifests
- Commercial
  - Proposals
  - Customer Quotes
  - Invoices
  - Payments / Credit Memos / RMAs
- Supplier (Partner)
  - Purchase Orders
  - Supplier Bills
  - Debit Memos
  - Bill Payments / Debit Memos / RTVs
- Reports & Dashboards
- Admin
  - Users
  - Account Profile
  - Authorized Locations
```

---

## 13. Current Development Status

**Status**: Phase 1 - Client Priority (In Progress)

### Completed Features

#### Authentication & Layout (Phase 0/1)
- ✅ Next.js 15.0.3 + React 19.0.0 setup
- ✅ Tailwind CSS 3.4.1 configured with global color palette
- ✅ Dark mode support implemented
- ✅ Responsive sidebar layout with collapsible navigation
- ✅ Authentication page (Sign In)
- ✅ Dynamic page name display in header

#### Orders Module (Phase 1 - Priority Feature)
- ✅ **Orders List Page** (`/orders`)
  - Stats dashboard with 4 metric cards (Total Orders, Order Items, Returns, Fulfilled Orders)
  - Order status filtering (All, Pending, Success, Draft, Cancelled)
  - Dynamic search across all order fields
  - Pagination (10 items per page)
  - Responsive table with sortable columns
  - Action buttons (Edit, Delete) for each order
  - Status badges with color coding
  - Export and bulk actions support
  - 20 mock orders for testing

- ✅ **Order Details/Create Page** (`/orders/[id]`)
  - Breadcrumb navigation (Orders > Create Order > Order #)
  - Client Information form (70% width):
    - Ship To, Shipping Address, Purchase Order #
    - Payment Terms, Requested Delivery Date
    - Retail Contact, Sales Rep
    - Additional Brand Contact, Factoring Assignee
    - Order Notes (full width textarea)
  - Order Total sidebar (30% width):
    - Products subtotal
    - Excise tax (with exclude option)
    - Grand total calculation
    - Order processing fee
    - Shipping, Distribution (17.2%)
    - Factoring discount
  - Product Search & Selection Table (full width):
    - Search by name, SKU, or price
    - Product filtering (All My Products, Review Order)
    - Table columns: Brand, SKU, Product Name, Available Cases, Unit Price, Subtotal, Is Sample, Case Quantity, Actions
    - Add/Remove product functionality
  - Fixed action buttons (Cancel, Save Draft, Submit Order)
  - Proper grid alignment (70/30 split)

- ✅ **Type Definitions & Mock Data**
  - TypeScript interfaces for Order, OrderStats, Product, OrderDetails
  - OrderStatus and FulfillmentStatus types
  - 20 realistic mock orders with various statuses
  - Mock stats for dashboard metrics

### Technical Implementation
- ✅ React hydration issues resolved with deterministic rendering
- ✅ Global color palette compliance (#96C2DB primary, #E5EDF1 light, #6B9DB8 dark)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support throughout
- ✅ Client-side state management with useState and useMemo
- ✅ Dynamic routing with Next.js App Router
- ✅ Proper TypeScript typing for all components
- ✅ Next.js 15 params Promise handling with React.use()

#### Salesforce API Integration (Ready for Activation)
- ✅ **API Service Layer** (`lib/api/salesforce.ts`)
  - OAuth 2.0 Username-Password authentication with token caching
  - SOQL query execution
  - CRUD operations for Orders and Products
  - Automatic fallback to mock data when not configured
  - Data mapping between Salesforce and application models

- ✅ **Custom React Hooks** (`hooks/`)
  - `useOrders()` - Fetch all orders with loading/error states
  - `useOrderStats()` - Fetch dashboard statistics
  - `useOrder(id)` - Fetch single order by ID
  - `useProducts()` - Fetch product catalog
  - All hooks support automatic fallback to mock data

- ✅ **UI Components** (`components/ui/`)
  - `LoadingSpinner` - Loading state indicator
  - `ErrorMessage` - Error display with retry functionality

- ✅ **Environment Configuration**
  - `.env.example` template for Salesforce credentials
  - Comprehensive integration guide in `SALESFORCE_INTEGRATION.md`

- 📝 **Integration Status**: Ready to activate when credentials are available
  - Current mode: Using mock data for development
  - To activate: Configure `.env.local` and update components to use hooks
  - See `SALESFORCE_INTEGRATION.md` for detailed setup instructions

### Next Steps (Phase 1 Continuation)
- [ ] Configure Salesforce credentials and activate API integration
- [ ] Update SOQL queries to match actual Salesforce schema
- [ ] Implement actual order submission workflow
- [ ] Add Product Catalog page
- [ ] Implement Proposals view
- [ ] Add Customer Quotes functionality
- [ ] Build Invoices page
- [ ] Implement Shipping Manifests view
- [ ] Add Reports/Dashboards functionality
- [ ] Implement "Pay Now" integration
- [ ] Add client user management

### Future Phases
- **Phase 2**: Partner Priority features
- **Phase 3**: Client-Partner hybrid role
- **Phase 4**: Hardening, performance testing, and scale optimization
