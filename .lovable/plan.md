

## Fix: Guest Portal Login Fails on Changeover Days

### Problem
On changeover days (when one guest departs and another arrives for the same room), the login query returns only the **newest** booking (`ORDER BY check_in DESC LIMIT 1`). This means the departing guest can never log in because the system only sees the arriving guest's booking.

Guest "A Fick" in COT(1) has check_out today (Mar 19), but "Gerard Benedicto" has check_in today (Mar 19). The query picks Benedicto, so Fick's last name never matches.

### Solution
Change the login logic to check **all active bookings** for the room instead of just one.

### File: `src/pages/GuestPortal.tsx` — `handleLogin` function

**Current logic (broken):**
- Query ONE booking for the room where `check_in <= today AND check_out >= today`, ordered by `check_in DESC`
- Compare entered last name against that single booking

**New logic (fixed):**
- Remove `limit(1)` and `.maybeSingle()` — fetch ALL active bookings for the room today
- Loop through results and find the booking whose guest last name matches the entered password
- If a match is found, log in with that booking
- If no match, show error

This naturally handles changeover days: both Fick and Benedicto can log in because the system checks all overlapping bookings, not just the newest one.

### Technical Details
- Change `.limit(1).maybeSingle()` to just fetching all results (remove both)
- Replace the single-booking name check with a `.find()` loop over all returned bookings
- The rest of the login flow (session creation, login tracking) stays the same, just uses the matched booking

### Impact
- Zero database changes required
- Only ~15 lines changed in one file
- Fixes all changeover-day login failures going forward

