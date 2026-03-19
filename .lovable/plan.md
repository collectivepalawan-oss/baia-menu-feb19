

## Plan: Stop Auto-Posting OTA Platform Payments to Guest Bill

### Problem
At check-in (line 676-694 in `ReceptionPage.tsx`), the system auto-inserts a **payment transaction** for bookings with a `paid_amount` (e.g. Booking.com, Airbnb). This shows on the guest's bill as if the resort already received payment — but OTA platforms pay the resort **later**, not at check-in. This makes the guest's balance look settled when it isn't, and confuses the checkout process.

The same logic exists for walk-in check-ins (though less relevant since walk-ins rarely have `paid_amount`).

### Solution
**Remove the auto-payment insertion** for OTA/pre-paid bookings in `src/pages/ReceptionPage.tsx`. The accommodation charge still gets posted (correct), but no phantom "Pre-payment via Booking.com" transaction gets created.

The `paid_amount` field remains useful for **internal tracking** in Resort Ops (ledger, revenue reports) — it just shouldn't generate a payment on the guest's room bill.

### File: `src/pages/ReceptionPage.tsx`

**Change 1 — Regular check-in (lines 676-694):**
Remove the block that inserts a payment transaction when `paid_amount > 0`. The accommodation charge (lines 659-674) stays.

**Change 2 — Walk-in check-in:**
Check if the same pattern exists in the walk-in flow (~lines 780-830) and remove it there too.

### What stays the same
- Accommodation charge still auto-posted at check-in (correct)
- `paid_amount` still stored on the booking record for reports/ledger
- Resort Ops dashboard still shows paid amounts for revenue tracking
- Guest portal, reception folio, and checkout all calculate balance correctly (charges minus actual payments only)

### Impact
- 1 file changed, ~15 lines removed
- No database changes
- Guest bills will now only show **real payments** made at the resort

