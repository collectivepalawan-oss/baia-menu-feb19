

## Step 2: Room Billing UI and Transaction Transparency

Building the front-end UI for the billing system using the Step 1 database infrastructure.

---

### Phase 2.1: Enhanced CartDrawer with Room Charging

**Modify `src/components/CartDrawer.tsx`**

- When order type is "Room", add a **guest name** input field and a **"Charge to Room" checkbox**
- When "Charge to Room" is selected as payment, auto-create a `room_transactions` entry on order submit with the order's subtotal, tax, service charge, and total
- Add VAT calculation using `billing_config.tax_rate` alongside the existing service charge logic (currently only SC is applied -- VAT is missing)
- Persist `guest_name`, `room_id`, `tax_details` JSONB, and `staff_name` (from `localStorage emp_name`) on the order record
- Show itemized tax breakdown in the summary section (Subtotal, SC, VAT, Total)

---

### Phase 2.2: Room Billing Tab

**Create `src/components/rooms/RoomBillingTab.tsx`**

- New tab added to `RoomsDashboard.tsx` detail view alongside Guest, Orders, Docs, Notes, Tours, Vibe
- Shows all `room_transactions` for the selected unit, sorted newest first
- Displays running balance (sum of charges minus sum of payments)
- Transaction list with date, description, amount, tax, SC, total, staff name
- Summary section: total charges by category, total payments received, remaining balance
- Action buttons: Add Payment, Add Adjustment, Print Bill, Checkout

**Create `src/hooks/useRoomTransactions.ts`**

- React Query hook fetching `room_transactions` filtered by `unit_id`

---

### Phase 2.3: Add Payment Modal

**Create `src/components/rooms/AddPaymentModal.tsx`**

- Dialog showing current balance
- Payment amount input
- Payment method selector (from `payment_methods` table)
- Notes field
- On submit: inserts a `room_transactions` row with `transaction_type: 'payment'` and negative amount to reduce balance
- Logs to `audit_log`

---

### Phase 2.4: Adjustment Modal

**Create `src/components/rooms/AdjustmentModal.tsx`**

- Dialog with adjustment type selector (Discount, Void, Complimentary, Correction)
- Transaction selector to pick which charge to adjust
- Reason text field (required)
- Manager name field for approval tracking
- On submit: inserts a `room_transactions` row with `transaction_type: 'adjustment'` or `'refund'`
- Logs to `audit_log`

---

### Phase 2.5: Checkout Modal

**Create `src/components/rooms/CheckoutModal.tsx`**

- Shows final bill summary: room charges (nights x rate from booking), all F&B charges, other charges
- Lists all payments received with running total
- Remaining balance calculation
- Final payment method selector and amount input
- On confirm:
  1. Records final payment in `room_transactions`
  2. Sets unit status to `to_clean`
  3. Creates housekeeping order (reusing existing checkout logic from `RoomsDashboard`)
  4. Logs to `audit_log`

---

### Phase 2.6: Audit Log Viewer

**Create `src/components/admin/AuditLogView.tsx`**

- New section accessible from Admin page (add as a tab or under an existing tab)
- Reads from existing `audit_log` table
- Filters: staff name, date range, action type, search text
- Displays entries in a timeline format: timestamp, staff name, action, details
- Shows summary stats: total actions today, most active staff
- Real-time subscription on `audit_log` table for live updates

**Modify `src/pages/AdminPage.tsx`**

- Add an "Audit Log" tab trigger in the admin tabs

---

### Phase 2.7: Print Bill

**Create `src/components/rooms/PrintBill.tsx`**

- Generates a printer-friendly HTML bill using `billing_config` receipt settings (header, footer, show_staff, show_itemized_taxes)
- Opens in a new window with `window.print()`
- Includes guest name, room, dates, itemized transactions, totals, and payment summary

---

### Technical Details

**Files to create:**
- `src/components/rooms/RoomBillingTab.tsx`
- `src/components/rooms/AddPaymentModal.tsx`
- `src/components/rooms/AdjustmentModal.tsx`
- `src/components/rooms/CheckoutModal.tsx`
- `src/components/rooms/PrintBill.tsx`
- `src/components/admin/AuditLogView.tsx`
- `src/hooks/useRoomTransactions.ts`

**Files to modify:**
- `src/components/CartDrawer.tsx` -- Add guest name, VAT calc, room charge transaction creation, staff_name/tax_details persistence
- `src/components/admin/RoomsDashboard.tsx` -- Add "Billing" to detail tabs, render `RoomBillingTab`
- `src/pages/AdminPage.tsx` -- Add Audit Log tab
- `src/lib/auditLog.ts` -- No changes needed (existing `logAudit` function is sufficient)

**Database changes:** None -- all tables already exist from Step 1. Enable realtime on `audit_log` for live feed.

**Patterns to follow:**
- Use existing `useBillingConfig` and `usePaymentMethods` hooks for dynamic config
- Use existing `logAudit()` helper for all write operations
- Match existing dark theme styling (`bg-secondary`, `border-border`, `font-display`, `text-cream-dim`)
- Use existing Dialog/Drawer component patterns from the UI library
- Mobile-first layout matching existing 44px min touch targets

