

## Plan: Fix Checkout Flow & Add Reopen Closed Checkouts

### Problem
1. **CheckoutModal** (rooms dashboard) doesn't set `checked_out_at` timestamp — guests appear auto-checked-out or stuck
2. No way to view or reopen completed checkouts if admin needs to make billing adjustments
3. Need a "Closed Checkouts" section where admin/reception can select a past checkout, reopen it (clear `checked_out_at`), make changes, then close again

### Changes

**1. `src/components/rooms/CheckoutModal.tsx` — Set `checked_out_at`**
- Line 200-203: Add `checked_out_at: new Date().toISOString()` to the booking update (currently only sets `check_out` date, missing the timestamp)

**2. `src/pages/ReceptionPage.tsx` — Add "Closed Checkouts" panel**
- Add a new collapsible section in the Reception departures area showing today's completed checkouts (bookings where `checked_out_at` is set and `check_out` = today)
- Each entry shows guest name, unit, checkout time
- **Admin only**: "Reopen" button that clears `checked_out_at` on the booking, sets unit status back to `occupied`, and logs an audit entry
- After admin makes adjustments, they can re-run checkout normally
- Use `usePermissions` to gate the reopen button to admin-level staff only

**3. `src/components/admin/RoomsDashboard.tsx` — Same closed checkouts visibility**
- Add matching "Closed Checkouts" section with reopen capability (admin dashboard already has admin access)

### Data flow
```text
Checkout completed → checked_out_at = timestamp, unit = to_clean
    ↓
"Closed Checkouts" section shows booking
    ↓
Admin clicks "Reopen" → checked_out_at = null, unit status = occupied
    ↓
Admin/reception makes billing adjustments on folio
    ↓
Re-checkout via normal flow → checked_out_at set again
```

### Files changed
- `src/components/rooms/CheckoutModal.tsx` (~1 line added)
- `src/pages/ReceptionPage.tsx` (~40 lines added — closed checkouts query + UI + reopen handler)
- `src/components/admin/RoomsDashboard.tsx` (~30 lines added — same closed checkouts section)

