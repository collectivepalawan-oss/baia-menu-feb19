

## Plan: Expand Receptionist Powers in Reception Dashboard

### Problem
Currently, check-in and check-out are locked behind `reception:manage` level. Receptionists with `reception:edit` can only sell rooms. There's no billing access, no ability to send housekeepers, and room info is limited.

### Changes to `src/pages/ReceptionPage.tsx`

**1. Downgrade check-in/check-out from `canDoManage` to `canDoEdit`**
- Line 444: Change checkout button guard from `canDoManage` to `canDoEdit`
- Line 475: Change check-in button guard from `canDoManage` to `canDoEdit`
- Receptionists with `edit` permission can now check guests in and out

**2. Add "Add Payment" button on each occupied room card**
- Import and render `AddPaymentModal` from existing component
- Show a payment button on occupied room cards for `canDoEdit` users
- Reuses the existing billing modal already built for the Rooms dashboard

**3. Add "Send to Clean" button on occupied rooms (after checkout or manually)**
- Add a button on rooms that are `occupied` or need manual housekeeping trigger
- On click: update unit status to `to_clean`, create a `housekeeping_orders` row (idempotent check), invalidate queries
- Gated behind `canDoEdit`

**4. Add "View Bill" button on each occupied room**
- Show a collapsible or modal view of `room_transactions` for any occupied unit
- Uses existing `useRoomTransactions` hook
- Available to all permission levels (including `view`)

**5. Permission level summary after changes**
- `view`: See all room info, guests, tours, requests, bills (read-only)
- `edit`: Check-in, check-out, sell rooms (set price), add payments, send housekeepers
- `manage`: Override rates on existing bookings (future use)

### No database changes needed
All tables and RLS policies already exist.

