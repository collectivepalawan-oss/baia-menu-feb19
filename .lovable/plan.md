

## Step 1: Core Room Charging and Transaction Database

### What We're Building
A Billing Configuration section in Admin Setup that lets you manage taxes, service charges, payment methods, and room charging rules -- plus a `room_transactions` ledger that tracks every charge against a room/guest.

---

### Database Changes

**1. Create `billing_config` table** (single-row settings, like `invoice_settings`)

| Column | Type | Default |
|--------|------|---------|
| id | UUID PK | gen_random_uuid() |
| enable_tax | BOOLEAN | true |
| tax_name | TEXT | 'VAT' |
| tax_rate | NUMERIC(5,2) | 12 |
| enable_service_charge | BOOLEAN | true |
| service_charge_name | TEXT | 'Service Charge' |
| service_charge_rate | NUMERIC(5,2) | 10 |
| enable_city_tax | BOOLEAN | false |
| city_tax_name | TEXT | '' |
| city_tax_rate | NUMERIC(5,2) | 0 |
| allow_room_charging | BOOLEAN | true |
| require_deposit | BOOLEAN | false |
| require_signature_above | NUMERIC | 5000 |
| notify_charges_above | NUMERIC | 10000 |
| default_payment_method | TEXT | 'Charge to Room' |
| show_staff_on_receipt | BOOLEAN | true |
| show_itemized_taxes | BOOLEAN | true |
| show_payment_on_receipt | BOOLEAN | true |
| show_room_on_receipt | BOOLEAN | false |
| receipt_header | TEXT | '' |
| receipt_footer | TEXT | 'Thank you! Please come again' |
| created_at | TIMESTAMPTZ | now() |
| updated_at | TIMESTAMPTZ | now() |

**2. Create `payment_methods` table**

| Column | Type | Default |
|--------|------|---------|
| id | UUID PK | gen_random_uuid() |
| name | TEXT | NOT NULL |
| is_active | BOOLEAN | true |
| requires_approval | BOOLEAN | false |
| sort_order | INTEGER | 0 |
| created_at | TIMESTAMPTZ | now() |

Seed with: Cash, Credit Card, Debit Card, Charge to Room, Complimentary, Bank Transfer, Foreign Currency.

**3. Create `room_transactions` table**

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| unit_id | UUID | FK to units(id) |
| unit_name | TEXT | Denormalized for display |
| guest_name | TEXT | Nullable |
| booking_id | UUID | FK to resort_ops_bookings(id), nullable |
| transaction_type | TEXT | 'room_charge', 'payment', 'refund', 'adjustment' |
| order_id | UUID | FK to orders(id), nullable |
| amount | NUMERIC(10,2) | |
| tax_amount | NUMERIC(10,2) | 0 |
| service_charge_amount | NUMERIC(10,2) | 0 |
| total_amount | NUMERIC(10,2) | |
| payment_method | TEXT | |
| staff_name | TEXT | |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | now() |

**4. Add columns to `orders` table**

- `guest_name TEXT DEFAULT ''`
- `room_id UUID` (nullable, references units)
- `tax_details JSONB DEFAULT '{}'`
- `staff_name TEXT DEFAULT ''`

All tables get public RLS (matching the existing app pattern -- no Supabase Auth used).

---

### New UI Components

**`BillingConfigForm.tsx`** -- New admin component under Setup tab

Sections:
1. **Tax and Service Charges** -- toggles + name/rate fields for VAT, Service Charge, City Tax
2. **Room Charging Rules** -- toggles for allow charging, require deposit, signature/notification thresholds
3. **Payment Methods** -- checklist of active methods with add/edit/delete and drag-to-reorder
4. **Receipt and Print Settings** -- toggles for staff name, itemized taxes, payment method, room number display; header/footer text fields

Single "Save" button persists everything to `billing_config`.

**`useBillingConfig.ts`** -- Hook to fetch billing_config (single row, like useInvoiceSettings pattern)

---

### Integration Points

- The existing `InvoiceSettingsForm` stays as-is for now (it manages invoice-specific fields like thank_you_message). The new `BillingConfigForm` handles the broader billing/tax/payment config.
- `CartDrawer.tsx` and `TabInvoice.tsx` will read from `billing_config` to compute taxes dynamically instead of hardcoding 10% service charge.
- When an order is placed with "Charge to Room", a row is auto-inserted into `room_transactions`.
- Payment method dropdowns across the app (TabInvoice close, order payment) will pull from the `payment_methods` table instead of hardcoded options.

---

### Files to Create
- `src/components/admin/BillingConfigForm.tsx` -- Full billing config admin UI
- `src/hooks/useBillingConfig.ts` -- React Query hook for billing_config table
- `src/hooks/usePaymentMethods.ts` -- React Query hook for payment_methods table
- Migration SQL for all 3 new tables + orders column additions

### Files to Modify
- `src/pages/AdminPage.tsx` -- Add BillingConfigForm to Setup tab, import new component
- `src/components/CartDrawer.tsx` -- Use billing_config for tax/SC calculations, add room charge flow
- `src/components/admin/TabInvoice.tsx` -- Use payment_methods from DB, apply billing_config tax rates
- `src/integrations/supabase/types.ts` -- Will auto-update after migration

### Seed Data
Insert 7 default payment methods into `payment_methods` and one default row into `billing_config` with sensible defaults (VAT 12%, SC 10%).

