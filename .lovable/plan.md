

## Making Service Boards Interactive Across Departments

### Problem
Currently each service screen is rigidly siloed: Kitchen can only do "Start Preparing" / "Mark Ready" for food, Bar only for drinks, Reception only "Mark Served" / "Mark Paid". A chef who sees a drink order can't help. Reception can't kick off a food order during a rush. There's no way to view order details, add notes, or see the full order context.

### Solution
Give every service screen cross-department action buttons based on the logged-in staff member's permissions, plus add interactive features (order detail drawer, item-level status, quick notes).

---

### Changes

**1. `src/components/service/ServiceOrderCard.tsx` — Cross-department actions**

Currently the action button logic is a single `if/else if` chain locked to `department`. Replace with a multi-action approach:

- Show the **primary action** for the current department (unchanged behavior)
- Add **secondary action buttons** for other departments when the staff member has those permissions (read from `staff_home_session`)
- Example: Kitchen screen shows "Start Preparing" as primary, but also shows a smaller "Mark Served" button if the chef has reception permission
- Action buttons rendered as a button group: primary (large, colored) + secondary (small, outline)
- Add a "tap to expand" detail view showing all items, notes, and order timeline

**2. `src/components/service/ServiceOrderDetail.tsx` — New file: Order detail drawer**

A bottom-sheet (Drawer) that opens when tapping an order card. Shows:
- Full item list with per-item department badges (🍳 Kitchen / 🍹 Bar)
- Per-department status indicators (kitchen_status, bar_status)
- Order timeline: created → preparing → ready → served
- Guest name, location, order type
- **All available actions** as full-width buttons (regardless of current screen department), gated by the user's permissions
- Quick note input to add a note to the order (stored in `items` JSONB as `order_note` field — no schema change)

**3. `src/components/service/ServiceBoard.tsx` — Pass permissions down**

- Read `staff_home_session` from sessionStorage to get the staff member's permissions
- Pass `permissions: string[]` to `ServiceOrderCard`
- Pass `onOpenDetail` callback to cards so tapping opens the detail drawer

**4. `src/components/service/ServiceOrderCard.tsx` — Enhanced card display**

- Add item count summary badges (e.g., "3 food · 2 drinks")
- Show per-department status dots (green = ready, orange = preparing, gray = pending) on every card regardless of department
- Add tap handler to open detail drawer
- Keep existing primary action button but make it contextual to permissions, not just department

**5. Action Button Logic (in ServiceOrderCard)**

New logic replaces the rigid department check:

```
Available actions computed from order state + user permissions:
- Has 'kitchen' perm + kitchen_status=pending → "Start Preparing" (kitchen)
- Has 'kitchen' perm + kitchen_status=preparing → "Mark Ready" (kitchen)
- Has 'bar' perm + bar_status=pending → "Start Mixing" (bar)
- Has 'bar' perm + bar_status=preparing → "Mark Ready" (bar)
- Has 'reception' perm + all depts ready → "Mark Served"
- Has 'reception' perm + status=Served → "Mark Paid"
```

The **primary** action shown on the card is the one matching the current screen's department. Secondary actions appear in the detail drawer.

**6. Service pages (ServiceKitchenPage, ServiceBarPage, ServiceReceptionPage) — No changes**

They just pass `department` prop. The interactivity comes from the shared components.

---

### File Summary

```
NEW:  src/components/service/ServiceOrderDetail.tsx  — order detail drawer
EDIT: src/components/service/ServiceOrderCard.tsx     — multi-action buttons, permission-aware, tap to detail
EDIT: src/components/service/ServiceBoard.tsx          — pass permissions + detail drawer state
```

No database changes. No routing changes. Existing functionality preserved — this only adds more action buttons and the detail drawer.

