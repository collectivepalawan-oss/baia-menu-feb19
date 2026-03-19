

## Plan: Fix Kitchen Display — Auto-Clear Ready Orders

### Problem
In the Kitchen service board, orders stay stuck in the "Ready" column after `kitchen_status = 'ready'` even though kitchen's job is done. Additionally, `Served` orders are incorrectly pushed back into the Ready column for kitchen/bar views (line 126 of ServiceBoard.tsx).

### Root Cause (ServiceBoard.tsx lines 118-130)
```
// Current broken logic for kitchen/bar:
else if (o.status === 'Served') cols.Ready.push(o);        // ← BUG: Served shouldn't show in kitchen
else if (deptStatus === 'ready' || o.status === 'Ready') cols.Ready.push(o);  // ← Keeps ready orders visible forever
```

### Fix: 2 files changed

**1. `src/components/service/ServiceBoard.tsx`** — Column bucketing for kitchen/bar
- Once `kitchen_status = 'ready'` (or `bar_status = 'ready'`), move order to **Completed** section (collapsible), not the Ready column
- Remove the line that puts `Served` orders into kitchen's Ready column
- Ready column in kitchen/bar will only show orders where dept status is 'ready' AND overall status is still `Preparing` (i.e., waiting for the other department to finish — mixed food+drink orders)
- Once overall status hits `Ready`, `Served`, or `Paid`, the order moves to Completed for kitchen/bar

**2. `src/components/service/ServiceBoard.tsx`** — handleAction for `mark-served`
- When "Serve & Close" is triggered on a tab/room order (`isAutoPayable`), also set `status = 'Paid'` and `closed_at` so it fully closes. This ensures tab orders move to the cashier/tab system cleanly and don't linger.

### Resulting Flow
```text
Kitchen view:
  New → Preparing → (mark ready) → Completed (collapsed)

Service/Reception view:
  New → Preparing → Ready → [Serve & Close] → Tab/Room folio

Cashier:
  Sees tab orders → "Close Tab" / "Charge to Room"

Guest Portal:
  Sees order on their folio in real-time
```

### What stays visible where
| Order State | Kitchen | Reception | Cashier | Guest Portal |
|---|---|---|---|---|
| kitchen_status=ready | Completed (collapsed) | Ready column | Ready column | Shows as "Preparing" |
| Served (tab/room) | Hidden | Hidden (auto-closed) | Tab dashboard | Shows on folio |
| Served (walk-in) | Hidden | Completed | Bill Out | N/A |

