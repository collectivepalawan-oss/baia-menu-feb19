

## Plan: Real-time Guest Bill with Itemized Charges

### Problem
The Guest Portal "My Bill" view has no real-time subscription, so guests don't see new charges (food, tours, transport, rentals) until they manually refresh. The bill should update live as staff confirms items and charges them to the room.

### Changes

**1. Add Realtime Subscription to BillView** (`src/pages/GuestPortal.tsx`)

Add a Supabase realtime channel on `room_transactions` filtered by `booking_id` so the bill updates instantly when staff adds charges or payments. Pattern already exists in `RequestsTrackerView`.

**2. Improve Bill Item Display**

Each transaction row should show:
- A category icon based on `notes` content (food order, tour, transport, rental, payment)
- The transaction description (currently `t.notes || t.transaction_type`)
- Staff name who processed it
- Timestamp
- Amount with color coding (charges vs payments)

**3. Add Pending Items Section**

Show a "Pending" section above the confirmed transactions that displays:
- Pending tour bookings (from `tour_bookings` where status = 'pending')
- Pending guest requests (transport/rentals from `guest_requests` where status = 'pending')
- These appear greyed out with a "Pending confirmation" badge so the guest knows these will be charged once staff confirms

This gives guests full visibility: what's been charged, what's been paid, and what's still pending.

### Technical Details

```typescript
// Add realtime to BillView
useEffect(() => {
  const channel = supabase
    .channel('guest-bill-realtime')
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'room_transactions',
      filter: `booking_id=eq.${session.booking_id}`,
    }, () => { qc.invalidateQueries({ queryKey: ['guest-bill', session.booking_id] }); })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [session.booking_id, qc]);
```

- Fetch pending `tour_bookings` and `guest_requests` for the booking to show as "upcoming charges"
- No database changes needed -- all tables already exist
- Single file edit: `src/pages/GuestPortal.tsx` (BillView component, ~lines 798-849)

