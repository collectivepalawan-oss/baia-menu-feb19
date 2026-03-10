

## Fix: F&B "Charge to Room" Orders Missing from Billing & Print Bill

### Root Cause
When an F&B order is placed with "Charge to Room" (either by staff or guest self-service), the CartDrawer creates a `room_transaction` record but **without a `booking_id`**. The Room Billing Tab and Print Bill query `room_transactions` filtered by `booking_id`, so the F&B charge is invisible — it exists in the database but is excluded from all views.

### Fix

**File: `src/components/CartDrawer.tsx`**

1. After the active booking lookup (line 262-278), capture the `booking_id` from the fetched booking
2. Include `booking_id` in the `room_transaction` insert (line 318-333)

Specifically, change the booking lookup to also capture the booking id:
```typescript
let resolvedBookingId: string | null = null;
// existing booking lookup...
if (activeBooking) {
  resolvedBookingId = activeBooking.id;
  // existing guest name logic...
}
```

Then add to the room_transaction insert:
```typescript
booking_id: resolvedBookingId || (guestSession?.booking_id ?? null),
```

The guest session (for guest portal orders) already has `booking_id` available. For staff orders, we get it from the active booking lookup which already runs.

Also need to update the booking lookup query to select `id` in addition to `guest_id`:
```typescript
.select('id, guest_id, resort_ops_guests(full_name)')
```

This single fix ensures all "Charge to Room" F&B orders appear in the Room Ledger, the balance calculation, the Print Bill, and the Checkout Modal — in real-time.

### Files to Edit
1. `src/components/CartDrawer.tsx` — Add `booking_id` to the room_transaction insert (3 small changes in the same function)

