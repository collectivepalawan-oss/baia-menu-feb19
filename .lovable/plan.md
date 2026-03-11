

## Redesign: Two-Phase Housekeeping Checkout Flow

### Current Problem
When checkout is initiated, the housekeeping button on the room detail opens the full `HousekeepingInspection` component which jumps straight into a config-heavy inspection+cleaning workflow. The user wants two distinct phases separated by the checkout itself:

**Phase 1 — Pre-Checkout Inspection** (before guest leaves):
- Housekeeper inspects for damages while guest is still present
- Submits inspection notes → Reception gets clearance signal
- Reception can then proceed with final payment and checkout

**Phase 2 — Post-Checkout Cleaning** (after guest leaves):
- After checkout, housekeeping gets cleaning checklist
- Completes cleaning + restocking → marks done
- Room transitions to "Ready for Check-in"

### Current Flow (broken)
```text
Checkout → Creates HK order (pending_inspection) → HK opens full config page
```

### New Flow
```text
1. Reception initiates checkout → HK order created with status 'pre_inspection'
2. HK taps banner → Pre-Checkout Inspection form (damage check only, simplified)
3. HK submits → status becomes 'inspection_cleared' + notes sent
4. Reception sees ✅ "Housekeeping Cleared" in checkout checklist
5. Reception completes final payment + checkout
6. Checkout transitions HK order to 'cleaning' status
7. HK taps banner → Cleaning checklist (supplies, restocking)
8. HK completes → Room → 'Ready'
9. Reception sees room as ready for next guest
```

### Changes

#### 1. Add `pre_inspection` and `inspection_cleared` statuses to the flow

No DB migration needed — the `status` column on `housekeeping_orders` is a text field, not an enum.

#### 2. Restructure CheckoutModal.tsx

- **Create HK order earlier**: When checkout modal opens (or when "Start Checkout" is tapped), create HK order with status `pre_inspection` if none exists
- **Add "Housekeeping Clearance" to pre-checkout checklist**: Show ✅ when HK order status is `inspection_cleared`, show ⏳ when `pre_inspection`
- **After checkout confirmation**: Update HK order status from `inspection_cleared` → `cleaning` (instead of creating a new one)

#### 3. Split HousekeepingInspection.tsx into two modes

Refactor the component to accept a `mode` prop:
- **`mode="pre_inspection"`**: Shows only the damage/condition checklist + damage notes + a "Clear for Checkout" button. No cleaning supplies, no cleaning package selector. Simplified, fast, mobile-friendly.
- **`mode="cleaning"`** (default/current): Shows cleaning checklist, supply quantities, cleaning notes, "Room Ready" button. Same as current step 2.

The step indicator and flow logic change based on mode.

#### 4. Update RoomsDashboard.tsx housekeeping banner

- For `pre_inspection` status: Show "🔍 Pre-Checkout Inspection Needed" banner → opens inspection in `pre_inspection` mode
- For `inspection_cleared`: Show "✅ Cleared for Checkout" (green, non-interactive for HK)
- For `cleaning`: Show "🧹 Cleaning in Progress" → opens cleaning mode
- For `completed`: Banner disappears (room is ready)

#### 5. Update HousekeeperPage.tsx

- Show `pre_inspection` orders in the "New Assignments" section with label "Pre-Checkout Inspection"
- Show `cleaning` orders as before in "In Progress"
- When HK accepts a `pre_inspection` order, it opens the simplified inspection form
- After submitting inspection, order goes to `inspection_cleared` — removed from HK's active list until checkout happens and status changes to `cleaning`

### Files to Edit

| File | Change |
|------|--------|
| `src/components/rooms/CheckoutModal.tsx` | Create HK order on modal open with `pre_inspection` status; add clearance check to checklist; transition to `cleaning` on checkout |
| `src/components/admin/HousekeepingInspection.tsx` | Add `mode` prop; split into pre-inspection (damage only) and cleaning (supplies) modes |
| `src/components/admin/RoomsDashboard.tsx` | Update banner labels and behavior for new statuses |
| `src/pages/HousekeeperPage.tsx` | Handle `pre_inspection` and `inspection_cleared` statuses in order lists |

