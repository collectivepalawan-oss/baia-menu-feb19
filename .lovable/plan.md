

## Plan: Guest Portal Real-Time Status Tracking

### Current State
- **My Orders**: Already has realtime subscription but only shows overall status. Does not show department-level progress (kitchen preparing, bar ready, etc.).
- **Tours, Transport, Rentals**: Guest submits requests but has NO way to see their status afterward. No "My Requests" view exists.

### Changes

**1. Enhance OrdersView with department-level status** (`src/pages/GuestPortal.tsx`)
- Show `kitchen_status` and `bar_status` as sub-badges when applicable (e.g., "🍳 Preparing", "🍹 Ready")
- Add "Closed" to the status map
- Already has realtime -- no changes needed there

**2. Add a "My Requests" section to the dashboard** (`src/pages/GuestPortal.tsx`)
- New view `'requests'` accessible from dashboard (new Tile)
- Query `tour_bookings` filtered by `booking_id` -- shows tour name, date, and status (pending/confirmed/cancelled/completed)
- Query `guest_requests` filtered by `booking_id` -- shows transport and rental requests with their status
- Add realtime subscriptions on both `tour_bookings` and `guest_requests` tables so status changes appear instantly
- Color-coded status badges: pending (amber), confirmed (green), cancelled (red), completed (muted)

**3. Wire realtime for tour_bookings and guest_requests**
- Subscribe to `postgres_changes` on `tour_bookings` filtered by `booking_id`
- Subscribe to `postgres_changes` on `guest_requests` filtered by `booking_id`
- Invalidate queries on change

### No database changes needed
- `tour_bookings` and `guest_requests` already have status columns
- Realtime is already enabled or will use channel subscriptions

### Technical Details
- New `RequestsTrackerView` component inside GuestPortal showing all submitted requests grouped by type
- New dashboard tile with a clipboard/checklist icon labeled "My Requests"
- Reuse existing query patterns from OrdersView for consistency

