

## Plan: Fix Tour/Request Billing Flow & Stale Checked-Out Guests

### Two problems identified

**Problem 1: Completed tours/requests still show as unpaid balance**
- When a tour is marked "completed", the status changes but the tour price stays in the balance calculation (`activeToursTotal` includes everything except `cancelled`).
- There's no mechanism to settle/charge the tour to the room ledger. A completed tour should either be posted as a room transaction (charge) or marked as paid — not left floating in the balance forever.
- Same issue exists for `guest_requests` with prices.
- Affects: `RoomBillingTab.tsx` (line 138), `CheckoutModal.tsx` (line 162 doesn't even include tours), `GuestPortal.tsx` (line 1194), and `PrintBill.tsx`.

**Problem 2: Checked-out guest (Peggy Lu) still visible in Order Type "Current Guests"**
- The query on `OrderType.tsx` line 59 correctly filters `checked_out_at IS NULL`, but the query uses a 30-second stale time and the `occupied-guests` query key may not be invalidated when checkout happens.
- The `CheckoutModal` checkout handler needs to invalidate the `occupied-guests` query key so the Order Type page refreshes immediately.

### Changes

**1. `src/components/rooms/RoomBillingTab.tsx` — Fix tour/request completion flow**
- When "Complete" is clicked on a tour, also post a `room_transaction` with type `tour` for the tour price (charging it to the room ledger)
- Change `activeToursTotal` to only count tours that are NOT `completed` and NOT `cancelled` (completed ones are now on the ledger)
- Same logic for requests: completion posts a `service_request` transaction to the ledger
- Change `activeRequestsTotal` to only count non-completed, non-cancelled requests
- Show "completed" tours/requests with a "Paid" or "Charged" badge instead of "completed"

**2. `src/pages/GuestPortal.tsx` — Match the same balance logic**
- `activeToursTotal` should exclude completed tours (they're now on the room ledger)
- `activeRequestsTotal` should exclude completed requests
- Show completed tours/requests as "Charged to Room" in the guest view

**3. `src/components/rooms/CheckoutModal.tsx` — Include tours/requests in balance + fix query invalidation**
- Add tours and requests totals to the checkout balance calculation (currently line 162 only uses `totalCharges - totalPayments + unpaidTotal`, missing tours/requests)
- On successful checkout, invalidate `occupied-guests` query key

**4. `src/components/rooms/PrintBill.tsx` — Same balance alignment**
- Ensure printed bill balance excludes completed (already-charged) tours/requests

**5. `src/pages/ReceptionPage.tsx` — Invalidate `occupied-guests` on checkout**
- After any checkout action, invalidate `occupied-guests` so the Order Type screen immediately drops the guest

### Data flow after fix
```text
Tour booked → status: "booked" → shows in balance as pending
Tour completed by staff → status: "completed" + room_transaction posted → moves to ledger
Balance: tours only count booked/confirmed (not completed/cancelled)
Checkout: settles remaining balance, invalidates occupied-guests query
Order Type: immediately reflects checkout
```

### Files changed
- `src/components/rooms/RoomBillingTab.tsx` (~20 lines — completion handlers + balance calc)
- `src/pages/GuestPortal.tsx` (~5 lines — balance calc)
- `src/components/rooms/CheckoutModal.tsx` (~10 lines — balance + invalidation)
- `src/components/rooms/PrintBill.tsx` (~5 lines — balance alignment)
- `src/pages/ReceptionPage.tsx` (~2 lines — invalidate occupied-guests on checkout)

