

# Kitchen Order Management & Reporting System

## Overview
Transform the Orders tab into a full kitchen workflow board (designed for tablet use by the chef), add a status pipeline for every order, and lay the groundwork for financial reporting.

---

## 1. Database Changes

**Add columns to `orders` table** (migration):
- `updated_at` (timestamptz, default now()) -- track last status change
- `closed_at` (timestamptz, nullable) -- when order is fully closed/paid

**Add trigger**: auto-update `updated_at` on row change using the existing `update_updated_at_column()` function.

**Enable Realtime** on `orders` table so the kitchen tablet auto-refreshes when new orders come in (no manual reload needed).

---

## 2. Orders Tab Redesign -- Kitchen Board

Replace the current flat list with a **Kanban-style pipeline** using horizontal tabs or columns:

```text
 [ New ]  [ Preparing ]  [ Served ]  [ Paid ]  [ Closed ]
```

**Each order card shows:**
- Order type and location (e.g. "DineIn -- Table 1")
- Timestamp (relative: "2 min ago")
- Item list with quantities
- Total amount
- Payment type (if staff order)
- **Action button** to advance to next status

**Status flow:**
1. **New** -- order just placed (card highlighted in gold)
2. **Preparing** -- chef taps "Start Preparing"
3. **Served** -- food delivered, tap "Mark Served"
4. **Paid** -- payment collected, tap "Mark Paid"
5. **Closed** -- final state, sets `closed_at` timestamp

Each transition updates the `status` column and `updated_at` in the database. Realtime subscription pushes changes to all open admin screens instantly.

**Filter controls:**
- Date filter (Today / Yesterday / All)
- Toggle to show/hide Closed orders (hidden by default)

---

## 3. Realtime Subscription

Subscribe to `postgres_changes` on the `orders` table so that:
- When a guest or staff places a new order, it appears on the kitchen tablet immediately
- When any admin updates a status, all other admin screens see it live

This uses the existing Supabase realtime client -- no edge function needed.

---

## 4. Reporting Tab (New)

Add a **fourth tab** to the admin dashboard: **Reports**

Tabs become: `Setup | Menu | Orders | Reports`

**Reports tab -- Phase 1 (this build):**
- **Date range picker** (Today / This Week / This Month / Custom)
- **Summary cards:**
  - Total Revenue (sum of `total` for Closed orders)
  - Total Orders count
  - Average Order Value
- **Revenue by Order Type** breakdown (Room / DineIn / Beach / WalkIn)
- **Top Selling Items** list (parsed from order JSON items)

**Reports tab -- Future-ready structure:**
- A placeholder section labeled "Food Cost and Profit Analysis (Coming Soon)" with a note that this will use the `food_cost` field from `menu_items` to calculate margins per item and overall profit
- A placeholder for "Tours Revenue" for when tours are added

---

## 5. File Changes Summary

| File | Change |
|------|--------|
| `supabase/migrations/...` | Add `updated_at`, `closed_at` to orders; attach trigger; enable realtime |
| `src/pages/AdminPage.tsx` | Refactor Orders tab into pipeline board with status buttons; add Reports tab; add realtime subscription |
| `src/components/admin/OrderCard.tsx` | New component -- single order card with status action button |
| `src/components/admin/ReportsDashboard.tsx` | New component -- revenue summary, top items, date filtering |

---

## Technical Details

**Migration SQL:**
- `ALTER TABLE orders ADD COLUMN updated_at timestamptz DEFAULT now();`
- `ALTER TABLE orders ADD COLUMN closed_at timestamptz;`
- `CREATE TRIGGER ... BEFORE UPDATE ON orders ... EXECUTE FUNCTION update_updated_at_column();`
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;`

**Realtime in AdminPage:**
```typescript
useEffect(() => {
  const channel = supabase
    .channel('orders-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      qc.invalidateQueries({ queryKey: ['orders-admin'] });
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []);
```

**Status advancement logic:**
- Each status maps to a "next" status: New->Preparing->Served->Paid->Closed
- On "Closed", sets `closed_at = now()`
- Only Closed orders count toward revenue reports

**Reports queries:**
- Revenue: `SELECT SUM(total) FROM orders WHERE status = 'Closed' AND closed_at BETWEEN ...`
- Top items: Parse `items` JSONB in JS after fetching closed orders for the date range
- All calculations done client-side from fetched data (no custom DB functions needed for Phase 1)

