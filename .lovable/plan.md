

## Plan: Enhance Print Bill with Resort Profile Data

### Current Setup
The **Print Bill** (`src/components/rooms/PrintBill.tsx`) currently pulls data from **two sources**, both configured in the Admin dashboard:

1. **Billing Config** (`billing_config` table) — via `useBillingConfig()`:
   - `receipt_header` → used as the resort name/header (falls back to "RESORT")
   - `receipt_footer` → thank you message (falls back to "Thank you!")
   - `show_staff_on_receipt`, `show_itemized_taxes` → toggle display options

2. **Resort Profile** (`resort_profile` table) — **NOT currently used** by Print Bill

This means the bill is missing: resort name, address, phone, email, TIN, tagline, and other resort details that already exist in the `resort_profile` table and are already used by the PDF invoice generator (`generateInvoicePdf.ts`).

### What to Change

**`src/components/rooms/PrintBill.tsx`** — Add `useResortProfile()` and `useInvoiceSettings()` hooks to enrich the printed bill:

1. Import and use `useResortProfile()` to get: resort name, address, phone, email, website, tagline
2. Import and use `useInvoiceSettings()` to get: TIN number, business hours, thank you message, footer text
3. Update the HTML template to include:
   - Resort name as main header (from `resort_profile.resort_name`, falling back to `billing_config.receipt_header`)
   - Tagline below resort name
   - Address, phone, email below header
   - TIN number in footer
   - Business hours in footer
   - Invoice settings thank-you message and footer text

This matches exactly how `generateInvoicePdf.ts` already works — making the thermal print bill consistent with the PDF invoice.

### Where to Configure
- **Resort name, address, phone, email, website** → Admin Dashboard → Resort Profile section
- **Receipt header/footer, tax display toggles** → Admin Dashboard → Billing Configuration
- **TIN, business hours, thank you message** → Admin Dashboard → Invoice Settings

### Files
```
EDIT  src/components/rooms/PrintBill.tsx  (add resort profile + invoice settings data to bill)
```

One file edit. No database changes needed — all data sources already exist.

