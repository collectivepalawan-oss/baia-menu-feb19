

## Plan: Add "Delete All Orders" Button for Admin

### Problem
Practice orders have accumulated and need to be bulk-deleted. Currently only individual order deletion exists.

### Solution
Add a "Delete All Orders" button in the admin Orders tab header area (next to the date filters). Admin-only, with a two-step confirmation to prevent accidents.

### Changes

**`src/pages/AdminPage.tsx`**
- Add a `deleteAllOrders` function that runs `supabase.from('orders').delete().neq('id', '')` (deletes all rows) and invalidates the orders query cache
- Add a `confirmDeleteAll` state boolean
- Place a red "Delete All" button near the date filter row, visible only when `isAdmin` is true
- First click sets `confirmDeleteAll = true` and shows "Confirm Delete All?" with a 3-second auto-reset (same pattern as individual delete)
- On confirm, execute the bulk delete + toast success + audit log entry

This follows the existing delete confirmation pattern already used in `OrderCard`.

### Files
```
EDIT  src/pages/AdminPage.tsx  — Add bulk delete function + button in orders pipeline view
```

