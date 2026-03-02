

## Implementation Plan: Room Passwords, Order Archive, and Expenses Bug Fix

### 1. Room-Specific Passwords for Guest Ordering

**Database Migration:**
- Add `room_password TEXT` and `password_expires_at TIMESTAMPTZ` columns to `resort_ops_bookings`
- Add index on `room_password` for quick lookup

**Check-In Flow (`src/components/admin/RoomsDashboard.tsx`):**
- After inserting the booking (step 3, line ~348), auto-generate a 6-digit numeric password
- Update the booking with `room_password` and `password_expires_at` (check_out + 1 day)
- Show the password in the success toast so staff can give it to the guest (e.g., "Room password: 123456")

**Landing Page (`src/pages/Index.tsx`):**
- Add a "Room Password" input field (6-digit numeric) between guest name and "Start Ordering" button
- Update `handleGuestVerify` to include password validation against `resort_ops_bookings.room_password`
- Check that `password_expires_at` has not passed

**Guest Session (`src/hooks/useGuestSession.ts`):**
- No changes needed -- session structure remains the same

### 2. "Served" Status Already Exists

Looking at the code, "Served" is already implemented:
- `OrderCard.tsx` line 13: `Served: { next: 'Paid', ... }`
- `DepartmentOrdersView.tsx` line 94: queries include `'Served'` status
- `StaffOrdersView.tsx` line 1: STATUSES includes `'Served'`
- The kitchen/bar views auto-set status to "Served" when all departments mark ready (line 163 of DepartmentOrdersView)

No changes needed here -- the status flow already works as described.

### 3. Order Archive in Admin

**New file: `src/components/admin/OrderArchive.tsx`**
- Full-history order view with filters: date range, order type, payment type, search
- Queries `orders` table without status filter, ordered by `created_at desc`
- Shows all order details: items, total, staff, payment, timestamps
- CSV export button
- Pagination (load more)

**Admin Page (`src/pages/AdminPage.tsx`):**
- Add "Archive" tab to the admin tabs list
- Render `OrderArchive` component in that tab

### 4. Expenses Keyboard Bug Fix

**Root Cause:** `ExpenseFormFields` is defined as a component **inside** `ResortOpsDashboard`, which means it gets a new identity on every render. React unmounts and remounts it, causing input focus loss.

**Fix (`src/components/admin/ResortOpsDashboard.tsx`):**
- Extract `ExpenseFormFields` to a standalone component outside the parent component (or at module level)
- Pass `scannedFields` and `scanningReceipt` as props instead of relying on closure
- This prevents React from destroying and recreating the inputs on each keystroke

### Technical Summary

| Change | Files |
|--------|-------|
| DB migration: add password columns | Migration SQL |
| Password generation at check-in | `src/components/admin/RoomsDashboard.tsx` |
| Password field on landing page | `src/pages/Index.tsx` |
| Order archive tab | New `src/components/admin/OrderArchive.tsx`, edit `src/pages/AdminPage.tsx` |
| Expenses keyboard fix | `src/components/admin/ResortOpsDashboard.tsx` |

