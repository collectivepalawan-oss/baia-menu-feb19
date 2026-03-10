

## Show Completed Tours in Guest Services Dashboard

### Problem
When a tour is marked "Completed," it vanishes from the Guest Services page because the main query (line 72-77) only fetches tours with status `booked` or `confirmed`. The tour drops into "Recent History," but that section uses `created_at` (not an update timestamp), so older tours marked complete today may not even appear there. Staff lose visibility of what was completed today.

### Fix

**1. `src/pages/ExperiencesPage.tsx` — Main tours query**
- Add `'completed'` to the status filter on line 75: `.in('status', ['booked', 'confirmed', 'completed'])`
- This makes completed tours appear in "Today's Tours & Activities" with their "completed" badge and dimmed styling (already handled by `statusColor`)
- No action buttons render for completed tours (already gated by `tour.status !== 'completed'` on line 421)

**2. `src/pages/ExperiencesPage.tsx` — Summary cards**
- Add a third summary count for "Completed" tours today alongside Pending and Confirmed, so staff can see at a glance how many are done

**3. `src/pages/ExperiencesPage.tsx` — Recent history query for tours**
- The `recentTours` query on line 121-126 filters by `created_at` which is wrong for catching recently-completed items. The `guest_tours` table doesn't have an `updated_at` column, so we should filter by `tour_date` instead (completed tours for today/yesterday) to reliably show them in history

### Files to edit
1. `src/pages/ExperiencesPage.tsx` — three small changes (query filter, summary card, history query)

