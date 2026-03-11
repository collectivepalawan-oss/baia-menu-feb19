

## Daily Cash Reconciliation Summary for Cashier

### Approach
Add a collapsible **Daily Summary** panel to the cashier's right-side panel (shown when no order is selected). This uses the already-fetched `orders` data — no new database tables or queries needed.

### What it shows

A summary card with:
- **Total Revenue Today**: sum of all Paid orders
- **Breakdown by Payment Method**: Cash, Card, GCash, Charge to Room, etc. — each showing count and total amount
- **Cash line highlighted** with a prominent display (since cash reconciliation is the primary concern)
- **Orders count**: total paid orders today
- Date/time stamp of when the summary was last refreshed

### Implementation

**File: `src/components/service/CashierBoard.tsx`**

Replace the empty-state "Tap an order to open bill & payment" placeholder (lines 285-290) with a `DailySummary` component that:

1. Filters `buckets.completed` (Paid orders) from today
2. Groups by `payment_type` and sums totals
3. Renders a clean summary card with:
   - Date header ("Today — Mar 11, 2026")
   - Total orders paid count
   - Total revenue (₱)
   - Per-method breakdown rows (icon + name + count + amount)
   - Cash row given a highlighted/accented style
   - A `Collapsible` section listing individual cash transactions for quick audit

This is a single-file change — just adding a new sub-component and swapping the empty-state render.

### Files Modified

| File | Change |
|------|--------|
| `src/components/service/CashierBoard.tsx` | Add `DailySummary` component, render when no order selected |

