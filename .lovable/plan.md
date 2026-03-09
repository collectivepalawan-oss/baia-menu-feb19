

## Fix: Gate Pipeline Actions in StaffOrdersView (Orders Tab)

### Problem
When Jessa (who has `orders:edit` only) taps the **Orders** tab at the bottom of the Menu page, she sees `StaffOrdersView` which displays `OrderCard` with full pipeline buttons — Start Preparing, Mark Served, Mark Paid. There are zero permission checks in this view. She should only be able to **place** orders, not advance them through the pipeline.

### Solution
Pass permission awareness into `StaffOrdersView` so that pipeline action buttons are hidden for staff who only have `orders:edit` (not `orders:manage`).

### Changes

**1. `src/components/staff/StaffOrdersView.tsx`**
- Import `getStaffSession` and `canManage`, `canEdit` from permissions
- Read the staff session permissions
- Compute `canPipeline` = `isAdmin || canManage(perms, 'orders') || canEdit(perms, 'kitchen') || canEdit(perms, 'bar')`
- Only pass `onAdvance` to `OrderCard` when `canPipeline` is true — if `onAdvance` is undefined, `OrderCard` already hides all pipeline buttons (the `{flow && onAdvance && ...}` check on line 235)
- Similarly, only pass `onAddItems` when `canPipeline` is true (adding items to served orders is a pipeline action)
- Only pass `onDelete` when admin

This is a minimal, clean fix because `OrderCard` already conditionally renders buttons based on whether callbacks are provided.

### Files

```
EDIT  src/components/staff/StaffOrdersView.tsx  — Add permission check, conditionally pass onAdvance/onAddItems
```

