# COMPLETE BUILD SPECIFICATION
## Granite & Tiles Shop — Inventory, Sales & Billing PWA
### Instructions for AI Builder (Claude / Antigravity)

---

> **HOW TO USE THIS DOCUMENT**
> This is a complete, production-ready specification. Read the entire document before writing a single line of code. Build in the exact phase sequence listed. Every screen, every business rule, every data model, every message template is defined here. Do not improvise on business logic — follow it exactly. Do improvise freely on visual design — make it beautiful.

---

## PART 1: PROJECT OVERVIEW & CONTEXT

### What This Is
A Progressive Web App (PWA) for a multi-location granite and tiles shop in Jaipur, India. The business deals in granite slabs, marble, tiles, adhesives, and allied materials. They have two physical store locations. The app manages inventory across both stores, records sales, generates professional PDF bills, and enables WhatsApp sharing of bills and delivery updates.

### Who Uses It
- **Owner/Admin**: One person. Sees everything. Manages employees, views all financials, profit/loss, inventory health, wastage. Configures all store and payment settings.
- **Store Manager**: 2–4 people across two stores. Makes sales, adds stock, logs wastage, updates delivery status, generates and shares bills.

### Platform Decision
**Progressive Web App (PWA)** — mobile-first, optimized for Android Chrome. Must work offline for reading inventory and viewing orders. Must support:
- "Add to Home Screen" (installable)
- Camera access (for product photos)
- PDF generation and download
- Native share sheet (for WhatsApp, Email, etc.)
- Persistent local storage (stay logged in)

---

## PART 2: TECH STACK — USE EXACTLY THIS

```
Frontend:         React (Vite) — single page app
Styling:          Tailwind CSS
State:            Zustand (lightweight global state)
Routing:          React Router v6
Database:         Supabase (PostgreSQL + Auth + Storage)
PDF Generation:   jsPDF + html2canvas
Image Storage:    Supabase Storage (compress before upload, max 800×600)
File Sharing:     Web Share API (navigator.share with file)
Offline:          Vite PWA plugin (service worker + manifest)
Charts:           Recharts
Icons:            Lucide React
Date handling:    date-fns
Unique IDs:       uuid (v4)
```

### Supabase Setup
- One Supabase project
- Row Level Security (RLS) enabled on all tables
- Owner sees all rows
- Store Manager sees rows where `store_id` matches their assigned store(s) OR rows with no store restriction (like products visible across stores)
- Auth: Supabase email/password auth — but email is actually `username@storename.local` format (we use username, not real email)
- JWT stored in localStorage — persistent, 30-day rolling session

---

## PART 3: DESIGN LANGUAGE

### Aesthetic Direction
**Industrial-Luxury.** This is a materials business — stone, granite, marble. The app should feel like the premium end of a trade professional tool. Think: dark slate backgrounds, warm stone accent tones (amber/terracotta), crisp white typography, heavy card borders with subtle texture. NOT corporate SaaS. NOT consumer pastel. Something that a craftsman with taste would be proud to use.

### Color Palette (CSS Variables)
```css
--bg-primary:      #0f0f0f;   /* near-black base */
--bg-surface:      #1a1a1a;   /* card backgrounds */
--bg-elevated:     #242424;   /* elevated cards, modals */
--accent-primary:  #c8842a;   /* warm amber — primary CTA */
--accent-secondary:#e8b86d;   /* lighter amber — hover states */
--accent-success:  #4caf7d;   /* green — paid, in stock */
--accent-warning:  #e8a020;   /* orange — advance, low stock */
--accent-danger:   #e85555;   /* red — overdue, out of stock */
--accent-info:     #5b9bd5;   /* blue — info states */
--text-primary:    #f0ece4;   /* warm white */
--text-secondary:  #9a9488;   /* muted warm grey */
--text-disabled:   #4a4640;   /* disabled states */
--border:          #2e2a26;   /* subtle borders */
--border-strong:   #4a4540;   /* prominent borders */
```

### Typography
- **Display/Headings**: `Playfair Display` (Google Fonts) — used for page titles, invoice headers, dashboard KPIs
- **Body/UI**: `DM Sans` (Google Fonts) — clean, readable, modern
- **Numbers/Data**: `DM Mono` (Google Fonts) — for prices, quantities, invoice numbers
- Import all three from Google Fonts

### Spacing & Layout
- Mobile-first. Max content width: 430px on mobile, 1200px on desktop (owner dashboard)
- Generous padding: minimum 16px horizontal on mobile
- Cards with 12px border radius, subtle box-shadow
- Bottom navigation bar on mobile (5 items max)
- Touch targets minimum 44×44px

### Motion
- Page transitions: 200ms ease fade+slide
- Card press: scale(0.98) on touch
- Success states: brief green flash + checkmark animation
- Loading states: skeleton screens (not spinners)
- Modal entry: slide up from bottom

---

## PART 4: DATABASE SCHEMA

Build these Supabase tables exactly:

```sql
-- STORES
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text not null,
  created_at timestamptz default now()
);

-- BUSINESS SETTINGS (one row, owner manages)
create table business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  gst_number text,
  logo_url text,
  upi_id text,
  upi_enabled boolean default true,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_ifsc text,
  bank_enabled boolean default true,
  whatsapp_number text,
  updated_at timestamptz default now()
);

-- EMPLOYEES
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  username text unique not null,
  role text not null check (role in ('owner', 'manager')),
  assigned_stores text[] default '{}', -- array of store IDs, empty = all stores
  is_active boolean default true,
  auth_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- PRODUCT CATEGORIES
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- 'Granite', 'Marble', 'Tile', 'Adhesive', 'Other'
  created_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id),
  sub_category text,
  origin_brand text,
  photos text[] default '{}', -- array of storage URLs
  is_active boolean default true,
  created_at timestamptz default now()
);

-- STOCK BATCHES (each purchase = one batch)
create table stock_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  store_id uuid references stores(id) not null,
  date_added date not null default current_date,
  added_by uuid references employees(id),
  slabs_total integer not null,
  slab_size_sqft numeric(10,2) not null,
  total_sqft numeric(10,2) not null, -- computed: slabs_total × slab_size_sqft
  slabs_remaining numeric(10,2) not null, -- can be decimal (1.5 slabs)
  sqft_remaining numeric(10,2) not null,
  purchase_rate_per_sqft numeric(10,2) not null,
  total_purchase_value numeric(12,2) not null, -- computed: total_sqft × purchase_rate
  batch_notes text,
  is_depleted boolean default false,
  created_at timestamptz default now()
);

-- CUSTOMERS
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- SALES
create table sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null, -- format: S1-INV-20240515-042
  sale_date date not null default current_date,
  recorded_at_store_id uuid references stores(id),
  employee_id uuid references employees(id),
  customer_id uuid references customers(id),
  transport_charges numeric(10,2) default 0,
  other_charges numeric(10,2) default 0,
  other_charges_label text,
  subtotal numeric(12,2) not null,
  grand_total numeric(12,2) not null,
  payment_status text not null check (payment_status in ('paid', 'advance', 'pending')),
  advance_amount numeric(12,2) default 0,
  advance_method text, -- 'cash','upi','neft','imps','cheque'
  advance_reference text,
  balance_amount numeric(12,2) default 0,
  balance_due_on text default 'delivery', -- 'delivery' or 'later'
  balance_collected boolean default false,
  balance_collected_date date,
  balance_method text,
  balance_reference text,
  delivery_date date,
  delivery_slot text, -- 'morning','afternoon','evening','tbd'
  delivery_address text,
  delivery_notes text,
  delivery_status text default 'pending' check (delivery_status in ('pending','dispatched','delivered')),
  delivery_person_name text,
  delivery_person_phone text,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- SALE ITEMS
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) not null,
  product_id uuid references products(id) not null,
  batch_id uuid references stock_batches(id) not null,
  source_store_id uuid references stores(id) not null,
  product_name_snapshot text not null, -- name at time of sale
  quantity_sqft numeric(10,2) not null,
  slabs_used numeric(10,2) not null,
  purchase_rate numeric(10,2) not null, -- hidden from customer bill
  selling_rate numeric(10,2) not null,
  item_subtotal numeric(12,2) not null, -- quantity_sqft × selling_rate
  item_profit numeric(12,2) not null,  -- (selling_rate - purchase_rate) × quantity_sqft
  created_at timestamptz default now()
);

-- WASTAGE LOG
create table wastage_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  batch_id uuid references stock_batches(id) not null,
  store_id uuid references stores(id) not null,
  logged_by uuid references employees(id),
  log_date date not null default current_date,
  wastage_type text not null check (wastage_type in ('broken','scrap','defect','other')),
  quantity_sqft numeric(10,2) not null,
  slabs_lost numeric(10,2),
  purchase_rate numeric(10,2) not null,
  gross_loss_value numeric(12,2) not null, -- quantity_sqft × purchase_rate
  scrap_eligible boolean default false,
  scrap_rate numeric(10,2) default 0,
  scrap_value numeric(12,2) default 0, -- quantity_sqft × scrap_rate
  net_loss numeric(12,2) not null, -- gross_loss - scrap_value
  notes text,
  photo_url text,
  created_at timestamptz default now()
);

-- CUSTOMER REQUESTS (out of stock)
create table customer_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  customer_name_freetext text, -- if customer not saved
  customer_phone_freetext text,
  product_description text not null,
  quantity_required text,
  budget_range text,
  preferred_timeline text,
  request_status text default 'open' check (request_status in ('open','sourcing','fulfilled','cancelled')),
  recorded_by uuid references employees(id),
  recorded_at_store_id uuid references stores(id),
  notes text,
  created_at timestamptz default now()
);

-- INVOICE SEQUENCE (one row per store, for auto-incrementing invoice numbers)
create table invoice_sequences (
  store_id uuid references stores(id) primary key,
  last_sequence integer default 0
);
```

---

## PART 5: APPLICATION ARCHITECTURE

### Folder Structure
```
src/
├── main.jsx
├── App.jsx
├── index.css
├── supabase/
│   └── client.js              # Supabase client init
├── stores/                    # Zustand state stores
│   ├── authStore.js
│   ├── inventoryStore.js
│   ├── salesStore.js
│   └── settingsStore.js
├── hooks/
│   ├── useAuth.js
│   ├── useInventory.js
│   ├── useSales.js
│   └── useSettings.js
├── utils/
│   ├── invoiceNumber.js       # Invoice number generation
│   ├── pdfGenerator.js        # jsPDF bill generation
│   ├── whatsappMessage.js     # Pre-written WA message composer
│   ├── calculations.js        # Slab/sqft math helpers
│   └── formatters.js          # Currency, date formatters
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── SkeletonLoader.jsx
│   │   └── BottomNav.jsx
│   ├── layout/
│   │   ├── AppShell.jsx       # Main layout wrapper
│   │   ├── PageHeader.jsx
│   │   └── StoreFilterBar.jsx
│   ├── inventory/
│   │   ├── ProductCard.jsx
│   │   ├── StockBadge.jsx
│   │   └── AddStockStepper.jsx
│   ├── sales/
│   │   ├── CartItem.jsx
│   │   ├── PaymentForm.jsx
│   │   └── SaleCard.jsx
│   ├── billing/
│   │   ├── BillPreview.jsx
│   │   └── ShareBillSheet.jsx
│   └── dashboard/
│       ├── KPICard.jsx
│       ├── RevenueChart.jsx
│       ├── StoreComparisonCard.jsx
│       └── OutstandingList.jsx
└── pages/
    ├── auth/
    │   └── LoginPage.jsx
    ├── owner/
    │   ├── OwnerDashboard.jsx
    │   ├── EmployeeManager.jsx
    │   ├── CustomerDatabase.jsx
    │   ├── SalesHistory.jsx
    │   ├── WastageReport.jsx
    │   ├── PendingRequests.jsx
    │   ├── DeliveryCalendar.jsx
    │   └── Settings.jsx
    ├── manager/
    │   ├── ManagerHome.jsx
    │   ├── Inventory.jsx
    │   ├── ProductDetail.jsx
    │   ├── AddStock.jsx        # 4-step stepper
    │   ├── NewSale.jsx         # Multi-step sale flow
    │   ├── MySales.jsx
    │   └── LogWastage.jsx
    └── shared/
        ├── BillView.jsx
        └── CustomerRequestForm.jsx
```

---

## PART 6: AUTH SYSTEM

### Login Page
- Full screen. Show business logo/name centered (from settings, or placeholder "Stone & Tile Manager" until set up).
- Username field + Password field
- "Login" button
- NO "Forgot password" on this screen — handled by owner only, in settings
- On submit: authenticate against Supabase auth
- On success: store session in localStorage (Supabase handles this automatically with `persistSession: true`)
- Check employee record to get role → redirect to Owner Dashboard OR Manager Home
- **NEVER redirect back to login unless manual logout or owner deactivates account**
- On app load: check for existing session → auto-login, skip login page entirely

### Session Rules
```javascript
// supabase/client.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
})
```

---

## PART 7: OWNER SETUP & SETTINGS PAGE

This is the first thing an owner fills in. Every field here populates bills and WhatsApp messages.

### Settings Sections:

**1. Business Info**
- Business Name (text)
- GST Number (text) — note: "GST not charged to customers, displayed on bill only"
- Upload Logo (image, stored in Supabase Storage)

**2. Store Details** (repeated for Store 1 and Store 2)
- Store Name
- Full Address (textarea)
- Phone Number

**3. Payment Channels**
- UPI ID (text) + Toggle "Show on bills & messages" ON/OFF
- Bank Account Name (text)
- Bank Account Number (text)
- IFSC Code (text)
- Bank Name (text) + Toggle "Show on bills & messages" ON/OFF
- Store Phone for Cash Payments (auto-filled from store phone above)

**4. Employee Management** (within settings)
- List of employees with name, store assignment, status (active/inactive)
- [+ Add Employee] button → modal:
  - Name, Phone
  - Assigned Store: Store 1 / Store 2 / Both
  - Role: Manager (owner role is reserved)
  - Auto-generate username from name (e.g., "Rajesh Kumar" → "rajesh.kumar")
  - Set temporary password
  - [Create Employee] → creates Supabase auth user + employee record
- Tap any employee → edit details, reset password, deactivate

---

## PART 8: BOTTOM NAVIGATION (Manager)

5 tabs, fixed at bottom:
1. 🏠 Home
2. 📦 Inventory
3. ➕ New Sale (center, accent colored, slightly larger)
4. 📋 My Sales
5. 👤 Profile / More

---

## PART 9: MANAGER HOME PAGE

Quick-access dashboard for the manager's daily work.

### Layout:
```
[Header: Store Name + Manager Name + Date]

[Today's Summary Row]
  My Sales Today: 4 | Revenue: ₹72,000

[Alert Cards — only show if relevant]
  🔴 2 products out of stock
  🟡 3 products low stock (< 5 slabs)
  ⏰ 3 deliveries due today

[Quick Actions Grid — 2×2]
  [+ Add Stock]    [🔍 Search Product]
  [📋 Pending Deliveries]  [🗑️ Log Wastage]

[Recent Sales — last 5, tappable]
  Each card: Customer name, Total, Payment status badge, Delivery date
```

---

## PART 10: INVENTORY PAGES

### Inventory List Page

**Filter Bar (sticky at top):**
- Search: text search by product name (debounced, 300ms)
- Store Filter: [All | Store 1 | Store 2]
- Category Filter: [All | Granite | Marble | Tile | Adhesive | Other]
- Stock Filter: [All | In Stock | Low Stock | Out of Stock]

**Product Card (in list):**
```
[Product Thumbnail Photo]   [Store Badge: 🔵S1 / 🟢S2]
Product Name                [Category Badge]
Available: 22 slabs / 2,200 sqft
Purchase Rate: ₹60/sqft     [Stock status badge]
[View Details]  [Add to Sale →]
```

**Cross-store products** (product physically in Store 2, viewed from Store 1):
- Show same card but store badge shows the other store in a different color
- Don't hide them — visibility across stores is a core feature

### Product Detail Page

```
[Photo carousel — swipeable if multiple photos]

[Product Name — large]
[Category | Sub-category | Origin/Brand]

━━━ STOCK BY STORE ━━━
Store 1:  12 slabs / 1,200 sqft  [IN STOCK]
Store 2:  10 slabs / 1,000 sqft  [IN STOCK]
Combined: 22 slabs / 2,200 sqft

━━━ BATCH HISTORY ━━━
[Batch May 2024]  Added: 30 slabs (3,000 sqft) @ ₹60/sqft
  Remaining: 22 slabs / 2,200 sqft | Wasted: 50 sqft
[Batch Mar 2024]  DEPLETED

━━━ WASTAGE SUMMARY ━━━
Total Wasted: 50 sqft (₹3,000 loss)

[+ Add New Stock Batch]
[+ Log Wastage / Damage]
[Add to New Sale →]
```

---

## PART 11: ADD STOCK FLOW (4-STEP STEPPER)

Show a progress indicator: Step 1 → 2 → 3 → 4

### Step 1: Product Photo
- Full-screen camera/gallery picker
- Tap to add up to 5 photos
- Show thumbnails of selected photos
- [Next →]

### Step 2: Product Details
- Is this a new product or adding to existing?
  - [Existing Product — search and select]
  - [New Product — fill details below]
- Product Name (text, required)
- Category (dropdown: Granite / Marble / Tile / Adhesive / Other)
- Sub-category (text, optional)
- Origin/Brand (text, optional)
- Store Location: [Store 1] [Store 2] — which store is this stock going to?
- [Next →]

### Step 3: Stock & Pricing
```
Number of Slabs:          [  30  ]
Size per Slab (sq ft):    [ 100  ]
─────────────────────────────────
Total Stock:               3,000 sq ft  ← auto-calculated, shown live

Purchase Rate (₹/sq ft):  [  60  ]
─────────────────────────────────
Total Stock Value:        ₹1,80,000  ← auto-calculated, shown live
```
- All calculations update live as user types
- [Next →]

### Step 4: Review & Confirm
- Show all details in a clean summary card
- Product photos thumbnail strip
- All entered values
- [← Edit] [✓ Confirm & Save Stock]
- On save: insert product (if new) + insert stock_batch + update inventory counts
- Show success animation → redirect to product detail

---

## PART 12: NEW SALE FLOW (MULTI-STEP)

### Step 1: Customer Information
- Customer Name (text) — required
- Customer Phone (text) — required for WhatsApp
- Customer Address (text) — optional here, required before bill
- Search existing customers: as user types phone, auto-suggest from customer DB
- If existing customer selected: auto-fill all fields
- [New Customer / Guest] toggle — if used, still save name+phone
- [Next →]

### Step 2: Select Products
- Same search + filter as inventory list
- Each product card has [Add to Cart] button
- Tapping [Add to Cart] → opens Item Config bottom sheet:

**Item Config Sheet:**
```
Product: Absolute Black Granite
Store 2 — 2,200 sqft available

Sale Type:
[○ Full Slabs]  [● Custom Area (sqft)]  [○ Mixed]

IF Custom Area:
  Quantity: [200] sqft
  (Available: 2,200 sqft)

IF Full Slabs:
  Number of Slabs: [2]
  Each slab: 100 sqft
  Total: 200 sqft (auto)

Selling Rate: ₹[90] per sqft

Line Total: ₹18,000 (auto-calculated live)

[Add to Cart ✓]
```

**CRITICAL BUSINESS RULES FOR ITEM CONFIG:**
- If selling from the OTHER store (not current manager's store), show yellow banner: "⚠️ Stock from Store 2 — arrange transfer/delivery from there"
- Auto-select the oldest batch (FIFO) for this product
- Validate: quantity requested ≤ sqft_remaining in selected batch
- If quantity exceeds one batch, split across batches automatically and show breakdown
- Selling rate must be > 0. Show purchase rate context (ONLY to managers — small grey text: "Your cost: ₹60/sqft") so they know their floor

**Cart Screen:**
```
[Cart Header: X items in cart]

[Item Card — each product]
  Product Name | Store badge
  Qty: 200 sqft | Rate: ₹90/sqft | ₹18,000
  [Edit] [Remove]

[+ Add More Products]

────────────────────────────────
  Subtotal:              ₹18,000
  Transportation: ₹[  500  ]  ← manual entry
  Other Charges:  ₹[_____] [Label: ______]  ← optional
────────────────────────────────
  GRAND TOTAL:           ₹18,500
────────────────────────────────

[Proceed to Payment →]
```

### Step 3: Payment
```
GRAND TOTAL: ₹18,500

PAYMENT STATUS:
[○ Full Payment Received]
[● Advance Payment Received]
[○ No Payment — Pay on Delivery]

── IF Full Payment ──────────────────
Amount Received: ₹18,500 (auto-filled)
Payment Method:
[Cash] [UPI] [NEFT] [IMPS] [Cheque]
Reference No. (optional): [_________]

── IF Advance ───────────────────────
Advance Amount: ₹[5,000]
Payment Method: [Cash] [UPI] [NEFT] [IMPS] [Cheque]
Reference: [_________]
Balance Due: ₹13,500 (auto)
Balance Due: [● On Delivery] [○ Later]

── IF No Payment ────────────────────
ℹ️ Full ₹18,500 due on delivery. No advance.

[Next →]
```

### Step 4: Delivery Details
```
Delivery Date: [📅 Date Picker]
Time Slot: [Morning] [Afternoon] [Evening] [TBD]
Delivery Address: [auto-fill from customer, editable]
Delivery Notes: [optional textarea]

[Preview Bill →]
```

### Step 5: Bill Preview
- Full bill rendered on screen (see Part 13 for exact bill format)
- Manager reads through everything
- [← Edit] [✓ Confirm Sale & Generate Bill]
- On confirm:
  - Create sale record in DB
  - Create sale_items records
  - Deduct sqft_remaining and slabs_remaining from stock_batch(es)
  - Update customer record (create if new)
  - Generate invoice number
  - Generate PDF
  - Navigate to Bill Ready screen

### Step 6: Bill Ready & Share
```
✅ Bill Generated!
Invoice: S1-INV-20240515-042

[📥 Download PDF]
[📱 Share Bill to WhatsApp]  ← opens native share with PDF + pre-written message
[📧 Share via Email / Other]
[🔗 Copy WhatsApp Message Text]

[Done — Go to Home]
```

---

## PART 13: BILL FORMAT (EXACT SPECIFICATION)

Generate this as a styled HTML → PDF using html2canvas + jsPDF.

### Bill Visual Layout:

```
┌─────────────────────────────────────────────────────┐
│  [LOGO if uploaded, else placeholder stone icon]    │
│  [BUSINESS NAME — large, Playfair Display]          │
│  [Store Name that recorded the sale]                │
│  [Store Address]  |  Ph: [Store Phone]              │
│  GST No: XXXXXXXXXX                                 │
├─────────────────────────────────────────────────────┤
│  Invoice No: S1-INV-20240515-042                    │
│  Date: 15 May 2024                                  │
│                                                     │
│  Bill To:                                           │
│  Name: Ramesh Sharma                                │
│  Phone: 98XXXXXXXX                                  │
│  Address: [if provided]                             │
│                                                     │
│  Delivery Date: 17 May 2024, Morning                │
├────┬──────────────────────┬───────┬────────┬────────┤
│ #  │ Product              │  Qty  │  Rate  │ Amount │
├────┼──────────────────────┼───────┼────────┼────────┤
│ 1  │ Absolute Black       │ 200   │ ₹90/ft │₹18,000 │
│    │ Granite              │ sq ft │        │        │
├────┴──────────────────────┴───────┴────────┴────────┤
│                          Subtotal:        ₹18,000   │
│                          Transportation:  ₹500      │
│                          Other: [label]: [amount]   │
│                          TOTAL:           ₹18,500   │
├─────────────────────────────────────────────────────┤
│ PAYMENT STATUS:                                     │
│                                                     │
│ [Scenario A — Full Paid:]                           │
│  ✅ Payment Received in Full: ₹18,500              │
│  Mode: UPI | Ref: XXXXXXXXX                         │
│  Balance Due: ₹0                                    │
│                                                     │
│ [Scenario B — Advance:]                             │
│  ✅ Advance Received: ₹5,000 (Cash)                 │
│  ⏳ Balance Due on Delivery (17 May): ₹13,500       │
│  Payment Options:                                   │
│  📱 UPI: [upi_id]          [show if enabled]        │
│  🏦 Bank: [bank details]   [show if enabled]        │
│  💵 Cash: Call [store_phone]                        │
│                                                     │
│ [Scenario C — No Payment:]                          │
│  ⏳ Full Payment Due on Delivery: ₹18,500           │
│  Payment Options:                                   │
│  📱 UPI: [upi_id]          [show if enabled]        │
│  🏦 Bank: [bank details]   [show if enabled]        │
│  💵 Cash: Call [store_phone]                        │
├─────────────────────────────────────────────────────┤
│  Prepared by: [Employee Name]                       │
│  Terms: Goods once sold will not be taken back.     │
│  Thank you for your business!                       │
│                                                     │
│  ── Visit Us Again ───────────────────────          │
│  📍 Store 1: [Store 1 Name]                         │
│     [Full Store 1 Address] | [Phone]                │
│  📍 Store 2: [Store 2 Name]                         │
│     [Full Store 2 Address] | [Phone]                │
└─────────────────────────────────────────────────────┘
```

### Invoice Number Generation Logic:
```javascript
// utils/invoiceNumber.js
// Format: S1-INV-YYYYMMDD-NNN (store prefix + date + sequence)
// Sequence resets daily. NNN is zero-padded 3 digits.
// Use invoice_sequences table to track last sequence per store per day
// If two sales happen simultaneously, use optimistic locking / retry

async function generateInvoiceNumber(storeId, storePrefix) {
  const today = format(new Date(), 'yyyyMMdd')
  // Fetch and increment sequence from invoice_sequences table
  // Return: `${storePrefix}-INV-${today}-${String(seq).padStart(3, '0')}`
}
```

---

## PART 14: WHATSAPP MESSAGE TEMPLATES

These are pre-written, bilingual (English + Hindi) messages. The app composes them as strings and triggers `navigator.share()` with the PDF file + message text. All `{{variables}}` are dynamically substituted from the sale record.

---

### TEMPLATE 1: Order Confirmed — Full Payment Done
```
🎉 *Order Confirmed | ऑर्डर कन्फर्म!*

Namaste {{customer_name}} ji! 🙏

Your order has been confirmed with *{{business_name}}*.
आपका ऑर्डर सफलतापूर्वक कन्फर्म हो गया है।

📋 *Invoice:* {{invoice_number}}
📦 *Items:* {{product_summary}}
💰 *Total:* ₹{{grand_total}}
✅ *Payment:* Received in Full | पूरा भुगतान प्राप्त हुआ

🚛 *Delivery:* {{delivery_date}}, {{delivery_slot}}
📍 {{delivery_address}}

हम आपके नए घर की सजावट के लिए शुभकामनाएँ देते हैं! 🏠✨
Wishing you a beautiful renovation ahead!

Please find your invoice attached.
कृपया संलग्न इनवॉइस देखें।

किसी भी सहायता के लिए: {{store_phone}}
For any help: {{store_phone}}

━━━━━━━━━━━━━━━━━━━━━━
🪨 *{{business_name}}*
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

---

### TEMPLATE 2: Order Confirmed — Advance Paid
```
✅ *Order Confirmed | ऑर्डर कन्फर्म!*

Namaste {{customer_name}} ji! 🙏

Your order is confirmed with *{{business_name}}*.
आपका ऑर्डर कन्फर्म हो गया है।

📋 *Invoice:* {{invoice_number}}
📦 *Items:* {{product_summary}}
💰 *Total Amount:* ₹{{grand_total}}
💵 *Advance Paid:* ₹{{advance_amount}} ✅
⏳ *Balance Due on Delivery:* ₹{{balance_amount}}

🚛 *Delivery:* {{delivery_date}}, {{delivery_slot}}
📍 {{delivery_address}}

*Payment Options | भुगतान के तरीके:*
{{if upi_enabled}}📱 UPI: {{upi_id}}{{/if}}
{{if bank_enabled}}🏦 Bank: {{bank_name}} | A/C: {{account_number}} | IFSC: {{ifsc}}{{/if}}
💵 Cash: Call {{store_phone}}

डिलीवरी पर ₹{{balance_amount}} का भुगतान तैयार रखें।
Please keep ₹{{balance_amount}} ready for payment on delivery.

कृपया संलग्न इनवॉइस देखें।
Please find your invoice attached.

━━━━━━━━━━━━━━━━━━━━━━
🪨 *{{business_name}}*
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

---

### TEMPLATE 3: Order Confirmed — No Payment (Pay on Delivery)
```
📋 *Order Placed | ऑर्डर दर्ज!*

Namaste {{customer_name}} ji! 🙏

Your order has been placed with *{{business_name}}*.
आपका ऑर्डर दर्ज हो गया है।

📋 *Invoice:* {{invoice_number}}
📦 *Items:* {{product_summary}}
💰 *Total Due on Delivery:* ₹{{grand_total}}
⏳ *Payment:* Due on Delivery | डिलीवरी पर भुगतान

🚛 *Delivery:* {{delivery_date}}, {{delivery_slot}}
📍 {{delivery_address}}

*Payment Options | भुगतान के तरीके:*
{{if upi_enabled}}📱 UPI: {{upi_id}}{{/if}}
{{if bank_enabled}}🏦 Bank: {{bank_name}} | A/C: {{account_number}} | IFSC: {{ifsc}}{{/if}}
💵 Cash: डिलीवरी पर (Cash on Delivery)

डिलीवरी के समय ₹{{grand_total}} का भुगतान तैयार रखें।
Please keep ₹{{grand_total}} ready at the time of delivery.

कृपया संलग्न इनवॉइस देखें।
Please find your invoice attached.

━━━━━━━━━━━━━━━━━━━━━━
🪨 *{{business_name}}*
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

---

### TEMPLATE 4: Out for Delivery — Payment Complete
```
🚛 *Out for Delivery! | डिलीवरी निकल चुकी है!*

Namaste {{customer_name}} ji! 🙏

Your order from *{{business_name}}* is on its way!
आपका ऑर्डर रास्ते में है!

📦 *Invoice:* {{invoice_number}}
🧑 *Delivery Person:* {{delivery_person_name}}
📞 *Contact:* {{delivery_person_phone}}

✅ *Payment:* Fully Paid | भुगतान पूर्ण हो चुका है

हम आशा करते हैं कि आपको हमारा सामान पसंद आएगा! 🏠✨
We hope you love your new material!

किसी भी समस्या के लिए संपर्क करें: {{store_phone}}
For any issue, contact us: {{store_phone}}

━━━━━━━━━━━━━━━━━━━━━━
🪨 *{{business_name}}*
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

---

### TEMPLATE 5: Out for Delivery — Balance Remaining
```
🚛 *Out for Delivery! | डिलीवरी निकल चुकी है!*

Namaste {{customer_name}} ji! 🙏

Your order from *{{business_name}}* is on its way!
आपका ऑर्डर रास्ते में है!

📦 *Invoice:* {{invoice_number}}
🧑 *Delivery Person:* {{delivery_person_name}}
📞 *Contact:* {{delivery_person_phone}}

💰 *Balance Due on Delivery:* ₹{{balance_amount}}
डिलीवरी पर ₹{{balance_amount}} का भुगतान तैयार रखें।
Please keep ₹{{balance_amount}} ready for the delivery person.

*Payment Options | भुगतान के तरीके:*
{{if upi_enabled}}📱 UPI: {{upi_id}}{{/if}}
{{if bank_enabled}}🏦 Bank: {{bank_name}} | A/C: {{account_number}} | IFSC: {{ifsc}}{{/if}}
💵 Cash: डिलीवरी पर (Cash on Delivery)

किसी भी समस्या के लिए: {{store_phone}}
For any issue: {{store_phone}}

━━━━━━━━━━━━━━━━━━━━━━
🪨 *{{business_name}}*
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

---

### TEMPLATE 6: Payment Reminder (Overdue / Due Soon)
```
🔔 *Payment Reminder | भुगतान अनुस्मारक*

Namaste {{customer_name}} ji! 🙏

*{{business_name}}* की ओर से एक विनम्र स्मरण।
A gentle reminder from *{{business_name}}*.

आपके ऑर्डर *{{invoice_number}}* का ₹{{balance_amount}} का
भुगतान {{due_date}} को देय है।

Your payment of *₹{{balance_amount}}* for order *{{invoice_number}}*
{{if overdue}}was due on {{due_date}}. Request you to please clear at the earliest.
बकाया राशि शीघ्र चुकाने का अनुरोध है।
{{else}}is due on {{due_date}}.
{{/if}}

*Payment Options | भुगतान के तरीके:*
{{if upi_enabled}}📱 UPI: {{upi_id}}{{/if}}
{{if bank_enabled}}🏦 Bank: {{bank_name}} | A/C: {{account_number}} | IFSC: {{ifsc}}{{/if}}
💵 Cash: Call {{store_phone}}

धन्यवाद 🙏 — *{{business_name}}*

━━━━━━━━━━━━━━━━━━━━━━
📍 {{store_1_name}}
{{store_1_address}} | {{store_1_phone}}

📍 {{store_2_name}}
{{store_2_address}} | {{store_2_phone}}
━━━━━━━━━━━━━━━━━━━━━━
```

### WhatsApp Share Implementation:
```javascript
// utils/whatsappMessage.js
async function shareToWhatsApp(sale, pdfBlob, settings) {
  const message = composeMessage(sale, settings) // uses templates above
  
  if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
    await navigator.share({
      text: message,
      files: [new File([pdfBlob], `Invoice-${sale.invoice_number}.pdf`, 
               { type: 'application/pdf' })]
    })
  } else {
    // Fallback: copy message + separately download PDF
    await navigator.clipboard.writeText(message)
    // trigger PDF download
    // show toast: "Message copied. PDF downloaded. Open WhatsApp to share."
  }
}
```

---

## PART 15: DELIVERY UPDATE FLOW

Manager accesses this from "Pending Deliveries" section on home screen or My Sales tab.

```
[Pending Delivery Card]
Order: S1-INV-20240515-042
Customer: Ramesh Sharma | 📞 98XXXXXXXX
Items: Absolute Black Granite (200 sqft)
Delivery: 17 May 2024, Morning
Payment: ₹13,500 pending
Status: 🟡 Awaiting Dispatch
[Mark as Out for Delivery]

── After tapping: ──────────────────────
Delivery Person Name: [______________]
Delivery Person Phone: [______________]
Notes (optional): [______________]
[✓ Confirm & Prepare WhatsApp Update]

── After confirming: ───────────────────
✅ Status updated to "Out for Delivery"
[📱 Send Update to Customer via WhatsApp]
   ← opens native share with Template 4 or 5

── Later, after delivery: ──────────────
[Mark as Delivered]
  IF balance pending:
    [Collect Payment]
    Amount: ₹13,500
    Method: [Cash][UPI][NEFT][IMPS]
    Reference: [optional]
    [Confirm Payment Received]
  Status → ✅ Delivered & Paid
```

---

## PART 16: WASTAGE LOGGING

Accessible from Manager Home quick action and Product Detail page.

```
[Wastage Log Screen]

Search/Select Product: [search field]
[Selected: Absolute Black Granite — Store 1 — May 2024 Batch]
Available in batch: 2,200 sqft | Purchase rate: ₹60/sqft

Wastage Type:
[○ Broken/Damaged] [○ Cutting Scrap] [○ Quality Defect] [○ Other]

Quantity Lost: [____] sqft    OR    [____] full slabs

── Live Calculation ──────────────
Gross Loss: ₹____  (qty × ₹60)

Can be sold as scrap? [Yes / No]
  IF Yes:
  Scrap Rate: ₹[____] per sqft
  Scrap Recovery: ₹____
  Net Loss: ₹____
──────────────────────────────────

Notes: [textarea, optional]
Photo of damage: [📷 optional]

[Log Wastage]
```

On save:
- Deduct sqft from `sqft_remaining` in batch
- Deduct slabs from `slabs_remaining`
- Insert into `wastage_log`
- If batch sqft_remaining hits 0 → mark batch as depleted

---

## PART 17: CUSTOMER REQUEST (OUT OF STOCK)

Accessible during product search in New Sale if product not found, or from Manager Home.

```
[Customer Request Form]

Product Description: [________________________]
(What are they looking for?)

Customer Name: [_______________]  ← pre-filled if customer already selected
Customer Phone: [_______________]

Estimated Quantity: [____] sqft / slabs
Budget Range: [₹____] to [₹____] per sqft (optional)
Preferred Timeline: [dropdown: ASAP / Within a week / Flexible]
Notes: [optional textarea]
Recorded at: Store [1 / 2]

[Save Request]
```

---

## PART 18: OWNER DASHBOARD (FULL SPECIFICATION)

This is the most important screen. The owner needs everything on one scrollable dashboard, filterable by date range and store.

### Dashboard Filter Bar (sticky):
- Store: [All Stores ▾] [Store 1] [Store 2]
- Period: [Today] [Yesterday] [This Week] [This Month] [Custom Range]

### Section 1: KPI Row (horizontal scroll, 4 cards)
```
[TOTAL REVENUE]     [GROSS PROFIT]     [TOTAL ORDERS]     [OUTSTANDING]
₹1,42,000           ₹48,000            7 orders           ₹43,500
↑12% vs yesterday   33.8% margin       today              4 orders
```

### Section 2: Store Comparison Card
Two-column layout:
```
Store 1                     Store 2
Revenue:  ₹80,000           Revenue:  ₹62,000
Profit:   ₹28,000           Profit:   ₹20,000
Orders:   4                 Orders:   3
Stock:    ₹12.4L            Stock:    ₹11.8L
[View Detailed Report]      [View Detailed Report]
```

### Section 3: Revenue Chart
- Recharts BarChart
- X-axis: days/dates
- Two bars: Revenue (amber) and Profit (green)
- Toggle above: [Revenue & Profit | Volume (sqft)]
- Tap any bar → drill-down modal showing that day's sales list

### Section 4: Inventory Health Panel
```
Total Products: 42
Total Stock Value: ₹24,60,000 (at purchase cost)
Potential Revenue: ₹38,90,000 (at avg selling rates)
Unrealized Profit: ₹14,30,000

[🔴 Out of Stock: 2]  [🟡 Low Stock: 3]  [🟢 Healthy: 37]
Tap each badge to see the relevant products
```

### Section 5: Wastage & Loss Panel
```
This Period:
Wastage Events:    8
Total Sqft Lost:   320 sqft
Gross Loss Value:  ₹19,200
Scrap Recovery:    ₹4,800
Net Unrecovered:   ₹14,400

[View Full Wastage Log →]
```

### Section 6: Outstanding Payments
```
TOTAL OUTSTANDING: ₹43,500

[Sortable table]
Customer     | Invoice   | Amount   | Due Date  | Status  | Action
Ramesh S.    | INV-042   | ₹13,500  | 17 May    | Due     | [WhatsApp Remind]
Suresh K.    | INV-038   | ₹18,000  | 18 May    | Due     | [WhatsApp Remind]
Vijay S.     | INV-029   | ₹8,500   | 12 May    | 🔴 Overdue | [WhatsApp Remind]
Mohan L.     | INV-035   | ₹3,500   | 19 May    | Due     | [WhatsApp Remind]

[Remind All via WhatsApp] ← opens share sheet for each, one by one
```

### Section 7: Employee Performance
```
[This Period ▾]
Employee    Store  Sales  Revenue    Profit
Rajesh K.   S1     12     ₹2,40,000  ₹82,000
Priya S.    S2     9      ₹1,86,000  ₹64,000
Amit G.     S1     7      ₹1,20,000  ₹41,000
[Tap any row → Employee Detail Report]
```

### Section 8: Top Selling Products
```
[This Period ▾]
1. Absolute Black Granite  — 4,200 sqft — ₹3,78,000
2. Kota Stone (Blue)       — 3,800 sqft — ₹2,28,000
3. Vitrified Tiles 60×60   — 2,100 sqft — ₹1,89,000
[View All →]
```

### Section 9: Pending Customer Requests
```
3 customers waiting
→ Italian White Marble (2 customers)
→ Anti-skid Tiles 60×60 (1 customer)
[View & Manage →]
```

### Section 10: Profit & Loss Summary
```
PROFIT & LOSS — [This Month]

Revenue from Sales:              ₹8,42,000
─ Cost of Goods Sold:           -₹5,60,000
                                 ─────────
Gross Profit:                    ₹2,82,000  (33.5%)
+ Transport Revenue:            +₹24,500
─ Net Wastage Loss:             -₹14,400
                                 ─────────
Net Operating Profit:            ₹2,92,100

[Download P&L Report as PDF]
```

---

## PART 19: DRILL-DOWN PAGES (OWNER)

### Sales History Page
- Full list of all sales, filterable by: store, employee, date range, payment status, product
- Each sale card shows: Invoice no., Customer, Total, Payment status, Delivery status, Employee
- Tap sale → Sale Detail (shows EVERYTHING including purchase cost, profit per item, full payment history)

### Employee Detail Report
- All sales by this employee
- Revenue + Profit generated
- Average sale value
- Products most sold
- Timeline chart

### Product Analytics Page
- For any product, shows:
  - All purchase batches and their rates
  - All sales (dates, quantities, rates)
  - Average selling rate vs average cost
  - Profit margin over time
  - Wastage events
  - Remaining stock

---

## PART 20: BUSINESS LOGIC — CRITICAL RULES

### Stock Deduction Rules
```
When a sale is confirmed:
1. For each sale_item:
   a. Find the assigned batch_id (selected during add-to-cart)
   b. Deduct quantity_sqft from batch.sqft_remaining
   c. Recalculate slabs_remaining = sqft_remaining / slab_size_sqft
   d. If sqft_remaining <= 0: mark batch as is_depleted = true
   e. If sale_type was "full slabs": also deduct whole number from slabs_remaining
2. If quantity spans multiple batches: deduct FIFO order, split across batches
```

### FIFO Batch Selection
```
When manager adds product to cart:
- Auto-select oldest non-depleted batch for that product at the source store
- If quantity > available in oldest batch, cascade to next oldest batch
- Show manager which batch(es) will be used
- Manager can override batch selection if needed (advanced option)
```

### Invoice Number Generation
```
Format: [StorePrefix]-INV-[YYYYMMDD]-[NNN]
Examples: S1-INV-20240515-001, S2-INV-20240515-001
- S1 and S2 have independent sequences
- Sequence resets daily to 001
- Use Supabase RPC function for atomic increment to prevent race conditions
```

### Profit Calculation
```
item_profit = (selling_rate - purchase_rate) × quantity_sqft
sale_gross_profit = sum of all item_profits
net_sale_profit = sale_gross_profit + transport_charges + other_charges
(note: transport and other charges are treated as pure revenue for simplicity)
```

### Payment Status Tracking
```
payment_status: 'paid' | 'advance' | 'pending'

balance_amount = grand_total - advance_amount

When balance is collected post-delivery:
  Update sale: balance_collected = true, balance_method, balance_reference
  This affects dashboard "Outstanding Receivables" calculation
```

---

## PART 21: OFFLINE CAPABILITY

Using Vite PWA plugin:

### Cache Strategy
- **Static assets**: Cache-first (app shell, fonts, icons)
- **Product data**: Stale-while-revalidate (show cached, refresh in background)
- **Sale flow**: Network-first, fallback to show "Offline — sale will sync when connected"

### Offline-Available Features
- Browse inventory (from cache)
- View existing orders and deliveries
- Create a sale (queue locally, sync when online — use indexedDB queue)
- Generate and share PDF (works fully offline once data is loaded)

### Service Worker
- Vite PWA plugin handles registration automatically
- Show "New version available — tap to update" banner when new version deployed

---

## PART 22: BUILD SEQUENCE — FOLLOW THIS ORDER

Build and test each phase completely before starting the next.

### PHASE 1 — Foundation (Build First)
1. Supabase project setup — all tables, RLS policies, seed data
2. React + Vite + Tailwind project scaffold
3. PWA manifest + service worker config
4. Auth system — login page, session persistence, role routing
5. Owner Settings page — business info, store details, payment info
6. Employee management (CRUD within settings)
7. Basic navigation shell (bottom nav for manager, sidebar for owner)

### PHASE 2 — Inventory
8. Product list page with search and filters
9. Product detail page
10. Add stock stepper (4 steps)
11. Photo upload to Supabase Storage
12. Stock batch tracking and display

### PHASE 3 — Sales & Billing
13. New sale flow — customer info step
14. Product search and add to cart
15. Cart review with transport/other charges
16. Payment screen (all 3 payment states)
17. Delivery details step
18. Bill preview screen (exact format from Part 13)
19. Sale confirmation — DB writes, stock deduction
20. PDF generation (jsPDF + html2canvas)
21. WhatsApp share (Web Share API with PDF + pre-written message)

### PHASE 4 — Operations
22. Delivery update flow (dispatch, delivered, collect balance)
23. Wastage logging
24. Customer request form
25. My Sales page (manager)
26. Pending deliveries view (manager)

### PHASE 5 — Owner Dashboard
27. KPI cards (today's numbers)
28. Store comparison panel
29. Revenue + profit chart (Recharts)
30. Inventory health panel
31. Outstanding payments list + WhatsApp remind
32. Employee performance table
33. Top products list
34. P&L summary
35. Sales history page (full filterable list)
36. Employee detail drill-down
37. Wastage report page
38. Customer database page
39. Pending customer requests page

### PHASE 6 — Polish
40. Offline support (Vite PWA plugin, IndexedDB queue)
41. Loading skeleton screens for all data-heavy pages
42. Error states and empty states (well-designed, not generic)
43. Toast notifications for all actions
44. "Add to Home Screen" prompt for first-time users
45. Performance audit — lazy load images, paginate long lists

---

## PART 23: ERROR HANDLING STANDARDS

### Every async operation must handle:
- Loading state: show skeleton or spinner
- Success state: show toast notification + update UI
- Error state: show descriptive error message + retry option

### Specific error cases:
- Stock insufficient: "Only X sqft available. Please adjust quantity."
- Network offline: "You're offline. Changes will sync when connected."
- Session expired: Silently refresh token. If refresh fails → login page.
- Supabase error: Log to console, show user-friendly message (not raw error)

---

## PART 24: ACCESSIBILITY & UX STANDARDS

- All touch targets ≥ 44×44px
- All form fields have visible labels (not just placeholder text)
- Destructive actions (delete, mark as wasted) require confirmation modal
- Currency always formatted as ₹XX,XX,XXX (Indian number system)
- Dates formatted as "15 May 2024" (not MM/DD/YYYY)
- Phone numbers auto-formatted as Indian mobile format
- All numbers right-aligned in tables
- Success = green, Warning = amber, Error = red — consistently

---

## PART 25: WHAT NOT TO BUILD (OUT OF SCOPE)

- No GST calculation (business is currently exempt/unregistered — leave the field but show 0%)
- No online payment collection (only records payment method, doesn't process payments)
- No customer-facing portal (this is a vendor/internal tool only)
- No automated WhatsApp sending (manual share only)
- No multi-currency (INR only)
- No barcode scanning (text-based search only for now)
- No bulk import/export of stock (manual entry only for now)

---

## PART 26: SECURITY RULES

### Supabase RLS (Row Level Security):
```sql
-- Employees can only see products (all stores — inventory visibility is shared)
-- Employees can only create/edit sales recorded at their assigned store
-- Only owner can see purchase rates, profit data, and full financials
-- Only owner can create/edit/delete employees
-- All users can read stores table (for display purposes)
-- Wastage: managers can create, only owner can delete
```

### Data Sensitivity:
- Purchase rates: NEVER show on customer-facing bill
- Purchase rates: Show to managers during sale (small, grey — floor awareness only)
- Profit data: Owner dashboard only
- Employee credentials: Hashed by Supabase Auth, never exposed

---

*End of Build Specification — Version 2.0*
*Prepared for: [Store Name], Jaipur*
*Total Screens: 35+ | Tables: 12 | Build Phases: 6*
