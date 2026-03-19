

## Plan: Cashier View — Served Orders Only + Smart Guest Detection

### Problem
The Cashier currently sees New, Preparing, and Ready orders via both the ServiceBoard kanban and CashierBoard. Cashier should only see Served orders awaiting payment settlement.

### Changes

**1. `src/pages/ServiceCashierPage.tsx` — Remove ServiceBoard**
- Remove `<ServiceBoard department="cashier" />` and the `<Separator>` — Cashier should not see the kanban pipeline at all.

**2. `src/components/service/CashierBoard.tsx` — Served-only + smart payment detection**

- **Query filter** (line 63): Change `.in('status', ['New', 'Preparing', 'Ready', 'Served'])` to `.eq('status', 'Served')` — only fetch Served orders.

- **Remove bucket logic** (lines 115-131): No more `active` vs `billOut` split. All orders are bill-out by definition since they're all Served.

- **Remove "ACTIVE ORDERS" section** (lines 262-277): No longer needed.

- **Remove action handlers** (lines 171-211 `handleAction`): Cashier never needs kitchen-start, bar-start, mark-served etc. These are kitchen/bar concerns.

- **Auto-detect in-stay guest**: When selecting an order in the BillOutPanel, match `order.guest_name` or `order.room_id` against `activeBookings`. If a match is found → show both "Charge to Room" (primary, pre-selected booking) and "Pay Now" (secondary). If no match → show only "Pay Now" payment methods, hide "Charge to Room" option entirely.

- **BillOutPanel update** (line 491+): Add an `isInStayGuest` prop. When true, show "Charge to Room" as primary prominent button with pre-selected booking, and "Pay Now" as secondary. When false, hide the "Charge to Room" option and OR divider, show only payment method grid.

- **Confirm handler**: When "Charge to Room" is confirmed, set `payment_type: 'Charge to Room'` and `status: 'Paid'` (existing logic already handles this). Keep room_id assignment from booking.

### Files changed
- `src/pages/ServiceCashierPage.tsx` (~3 lines removed)
- `src/components/service/CashierBoard.tsx` (~40 lines changed)

No changes to Kitchen, Bar, or other boards.

