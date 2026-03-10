

## Remove Redundant "Bill" Button, Make Room Orders Expandable with Corrections

### Problems
1. **"Bill" dropdown button is redundant** — The "Details" button already opens a full `RoomsDashboard` (which includes `RoomBillingTab`) in a bottom sheet. The inline "Bill" toggle duplicates this and clutters the guest card.
2. **Recent Room Orders are not expandable** — The orders section (lines 1357-1377) shows only room name, guest, total, and status badge. Staff cannot see what items are in the order, the 10% service charge, or take corrective action (edit, comp, mark paid, delete).
3. **No corrective actions on orders from the reception view** — If kitchen/bar made a mistake, reception has no way to fix it from the current guest card without going into "Details."

### Changes

**1. `src/pages/ReceptionPage.tsx`**
- **Remove the "Bill" button** (lines 1076-1079) and the collapsible `RoomBillingTab` section (lines 1092-1094) from the occupied unit cards. The `billUnitId` state and `InlineBill` component can also be removed.
- **Make Recent Room Orders expandable** — Replace the flat order cards (lines 1363-1376) with expandable cards that show:
  - Tap to expand: itemized contents (qty × name × price per item)
  - Service charge breakdown: Subtotal, SC 10%, Total
  - Corrective action buttons: Edit total (✏️), Comp, Mark Paid, Delete — same actions as `RoomBillingTab` already implements
  - Status badge with descriptive text (e.g., "Being prepared" for Preparing, "Served ✓")
- Show **all** room orders for current guests (not just 8), grouped by unit, including total with SC

**2. `src/pages/GuestPortal.tsx`** — No changes needed, the BillView already shows itemized orders with SC breakdown and status badges correctly.

### Files to Edit
1. `src/pages/ReceptionPage.tsx` — Remove "Bill" button/collapsible, make Recent Room Orders expandable with item details and corrective actions

