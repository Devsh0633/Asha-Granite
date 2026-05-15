-- ASHA GRANITE PWA - COMPLETE DATABASE SCHEMA
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. STORES
create table stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text not null,
  created_at timestamptz default now()
);

-- 2. BUSINESS SETTINGS
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

-- 3. EMPLOYEES
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  username text unique not null,
  role text not null check (role in ('owner', 'manager')),
  assigned_stores text[] default '{}',
  is_active boolean default true,
  auth_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 4. PRODUCT CATEGORIES
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- 5. PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references categories(id),
  sub_category text,
  origin_brand text,
  photos text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. STOCK BATCHES
create table stock_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  store_id uuid references stores(id) not null,
  date_added date not null default current_date,
  added_by uuid references employees(id),
  slabs_total integer not null,
  slab_size_sqft numeric(10,2) not null,
  total_sqft numeric(10,2) not null,
  slabs_remaining numeric(10,2) not null,
  sqft_remaining numeric(10,2) not null,
  purchase_rate_per_sqft numeric(10,2) not null,
  total_purchase_value numeric(12,2) not null,
  batch_notes text,
  is_depleted boolean default false,
  created_at timestamptz default now()
);

-- 7. CUSTOMERS
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  created_at timestamptz default now()
);

-- 8. SALES
create table sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique not null,
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
  advance_method text,
  advance_reference text,
  balance_amount numeric(12,2) default 0,
  balance_due_on text default 'delivery',
  balance_collected boolean default false,
  balance_collected_date date,
  balance_method text,
  balance_reference text,
  delivery_date date,
  delivery_slot text,
  delivery_address text,
  delivery_notes text,
  delivery_status text default 'pending' check (delivery_status in ('pending','dispatched','delivered')),
  delivery_person_name text,
  delivery_person_phone text,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);

-- 9. SALE ITEMS
create table sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) not null,
  product_id uuid references products(id) not null,
  batch_id uuid references stock_batches(id) not null,
  source_store_id uuid references stores(id) not null,
  product_name_snapshot text not null,
  quantity_sqft numeric(10,2) not null,
  slabs_used numeric(10,2) not null,
  purchase_rate numeric(10,2) not null,
  selling_rate numeric(10,2) not null,
  item_subtotal numeric(12,2) not null,
  item_profit numeric(12,2) not null,
  created_at timestamptz default now()
);

-- 10. WASTAGE LOG
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
  gross_loss_value numeric(12,2) not null,
  scrap_eligible boolean default false,
  scrap_rate numeric(10,2) default 0,
  scrap_value numeric(12,2) default 0,
  net_loss numeric(12,2) not null,
  notes text,
  photo_url text,
  created_at timestamptz default now()
);

-- 11. CUSTOMER REQUESTS
create table customer_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  customer_name_freetext text,
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

-- 12. INVOICE SEQUENCE
create table invoice_sequences (
  store_id uuid references stores(id) primary key,
  last_sequence integer default 0
);

-- ENABLE RLS
alter table stores enable row level security;
alter table business_settings enable row level security;
alter table employees enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table stock_batches enable row level security;
alter table customers enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table wastage_log enable row level security;
alter table customer_requests enable row level security;
alter table invoice_sequences enable row level security;

-- BASIC SEED DATA
insert into categories (name) values ('Granite'), ('Marble'), ('Tile'), ('Adhesive'), ('Other');

-- NOTE: CREATE STORES MANUALLY OR VIA OWNER SETTINGS
