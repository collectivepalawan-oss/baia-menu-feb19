

## Fix: Guest Portal Login Fails When Multiple Bookings Overlap on Same Day

### Root Cause
The guest portal login query uses `.maybeSingle()` which returns `null` when more than one row matches. On changeover days (like today, Mar 10), the departing guest (John Doe, check_out = Mar 10) and the arriving guest (Test James, check_in = Mar 10) both satisfy `check_in <= today AND check_out >= today` for the same room. Since two rows are returned, `.maybeSingle()` fails silently and returns null → "No active booking found."

### Fix
In `src/pages/GuestPortal.tsx`, change the login query to:
1. Also match by the entered last name (join to `resort_ops_guests` and filter by last name) so only the correct guest's booking is returned
2. If that's not unique enough, order by `check_in DESC` and use `.limit(1).single()` to prefer the newest booking (the arriving guest over the departing one)

Specifically:
- Change `.maybeSingle()` to `.order('check_in', { ascending: false }).limit(1).maybeSingle()` — this picks the latest check-in booking, which is the arriving guest on changeover days
- This ensures the departing guest (whose check_out = today) is deprioritized in favor of the new arrival

### File to Edit
1. `src/pages/GuestPortal.tsx` — One-line change to the booking query (add `.order('check_in', { ascending: false }).limit(1)` before `.maybeSingle()`)

