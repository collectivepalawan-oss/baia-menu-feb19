
Problem
- The system still shows Thierry as “Check In” because the current shared room resolver only looks at:
  - booking dates
  - raw room status
- It does not persist or read an explicit “this reservation has already been checked in” marker.
- I confirmed today’s COT(1) booking has a room password set, which means the check-in action did run, but the UI still treats it as a pending arrival because the resolver has no durable booking-level check-in signal to use.

What I found
- Reception reserved-arrivals flow updates only `room_password` and `password_expires_at`, then sets the room to `occupied`.
- The booking table does not currently have `checked_in_at` / `checked_out_at`.
- The display logic in `src/lib/receptionOccupancy.ts` still computes:
  - `pendingArrival` from `check_in === today`
  - `activeBooking` mostly from room status and date overlap
- On a same-day arrival / extension-review case, that makes the booking stay in the “Arrivals / Check In” path even after staff has already checked them in.

Why this needs to stay in the existing format
- You already have a real check-in workflow coded in Reception.
- The fix should preserve that workflow, not replace it with ad hoc room-status logic.
- The UI should treat “checked in” as a booking event, not just “room is occupied”.

Implementation plan
1. Add explicit booking lifecycle fields
- Add `checked_in_at` and `checked_out_at` to the bookings table.
- Backfill only where it is safe:
  - do not guess historic data broadly
  - optionally infer current-day already-checked-in bookings that clearly have check-in artifacts if needed, but keep this conservative

2. Update the existing Reception check-in / checkout handlers
- In `ReceptionPage.tsx`:
  - on reservation check-in, set `checked_in_at`
  - on walk-in check-in, create the booking with `checked_in_at`
  - on checkout, set `checked_out_at`
- Keep all existing side effects:
  - room password generation
  - room status changes
  - billing and audit logs
  - housekeeping workflow

3. Teach the shared occupancy resolver about actual check-in state
- Extend `src/lib/receptionOccupancy.ts` so it uses:
  - checked-in booking = `checked_in_at` is set and `checked_out_at` is not set
  - pending arrival = arrival today without `checked_in_at`
  - pending departure = departure today with `checked_in_at` and no `checked_out_at`
- Preserve your current turnover / extension-review behavior, but make the booking lifecycle the source of truth.

4. Align Reception, Admin, and Morning Briefing
- `ReceptionPage.tsx`
  - Arrivals Today should only show bookings not yet checked in
  - Current Guests should show Thierry immediately after check-in
- `RoomsDashboard.tsx`
  - “Arrival Today / Check In Guest” should disappear once the booking is checked in
  - room detail header and badges should reflect the actual booking state
- `MorningBriefing.tsx`
  - arrivals/departures counts should follow checked-in / checked-out state, not just raw dates

5. Preserve current UX
- Keep the existing reception check-in modal/button flow exactly as the primary path
- Do not replace it with a new admin-only shortcut
- The visible change should simply be: after check-in, the guest moves through the proper in-house flow automatically

Files likely to change
- `src/lib/receptionOccupancy.ts`
- `src/pages/ReceptionPage.tsx`
- `src/components/admin/RoomsDashboard.tsx`
- `src/components/MorningBriefing.tsx`
- a new database migration for booking lifecycle timestamps

Expected result
- When you check in Thierry in COT(1), he should stop showing as “Check In”.
- He should move into the normal occupied / in-house flow.
- Same-day arrivals that are not yet checked in will still remain in the arrival format you already designed.
- Checkout and housekeeping behavior will continue to work through the same channels already coded.
