

## Comprehensive Checkout Accountability Workflow

### Problem
The current system has gaps in the checkout process:
1. Orders marked "Ready" by kitchen/bar can sit without being "Served" -- they don't appear correctly on the guest bill
2. Tours, bike rentals, and experiences have no "completed" status flow for admin/receptionist
3. Housekeeping has no "room clear" confirmation step before checkout
4. Guest has no way to review/agree to their final bill before checkout
5. Admin/receptionist boards don't show a unified pre-checkout checklist

### Changes

**1. Ensure "Served" step is enforced for all orders (already works)**
The current flow already requires "Mark Served" after "Ready" in ServiceOrderDetail and ServiceBoard. The image shows an order at "Served" status. Orders only appear on the guest bill (BillView) when status = 'Served' and payment_type is room charge. This is working correctly -- no code change needed here.

**2. Add "Mark Complete" action for tours/experiences/rentals on admin & reception boards**
- **File**: `src/pages/ExperiencesPage.tsx` (or the Guest Services management component)
- Add a "Mark Complete" button on confirmed tours (`guest_tours`) and confirmed requests (`guest_requests`) so admin/receptionist can mark them as `completed`
- Completed tours/experiences will then show on the guest bill with a "Completed" badge

**3. Add housekeeping room clearance step to checkout flow**
- **File**: `src/components/rooms/CheckoutModal.tsx`
- Before checkout can be confirmed, check if there's an active `housekeeping_orders` record for the unit
- Add a "Room Cleared" status option: housekeeping marks the room as `inspected_ok` or `has_damages` with notes
- Show clearance status in the checkout modal (green checkmark if cleared, warning if pending)
- If not cleared, show a warning but still allow admin override

**4. Add guest bill review/agreement on Guest Portal**
- **File**: `src/pages/GuestPortal.tsx`
- Add a "Review & Agree" button at the bottom of the BillView
- When guest taps it, save an agreement record (timestamp + guest name) to a new field on the booking or a simple flag
- Show "Bill Agreed ✓" status on the reception/admin checkout modal so receptionist knows guest has reviewed

**5. Add pre-checkout checklist on CheckoutModal**
- **File**: `src/components/rooms/CheckoutModal.tsx`
- Show a checklist section:
  - ✓/✗ All orders served & settled
  - ✓/✗ All tours/experiences completed
  - ✓/✗ Room inspected by housekeeping
  - ✓/✗ Guest bill reviewed (from portal)
- Each item is auto-calculated from existing data
- Warnings shown for incomplete items, but checkout can still proceed with override

### Database Changes

**Migration**: Add `bill_agreed_at` column to `resort_ops_bookings`:
```sql
ALTER TABLE resort_ops_bookings 
ADD COLUMN IF NOT EXISTS bill_agreed_at timestamptz DEFAULT NULL;
```

Add `completed` status support for `guest_tours` (already exists in REQUEST_STATUS_MAP) and ensure the experiences management UI has the action button.

### Files to Create/Edit
1. `src/components/rooms/CheckoutModal.tsx` -- Add pre-checkout checklist with auto-calculated statuses
2. `src/pages/GuestPortal.tsx` -- Add "I agree to this bill" button in BillView, write `bill_agreed_at` 
3. `src/pages/ExperiencesPage.tsx` -- Add "Mark Complete" button for confirmed tours/requests
4. Database migration -- Add `bill_agreed_at` to `resort_ops_bookings`

### Flow Summary
```text
Guest Stay Lifecycle:
                                                    
  Order Placed → Kitchen/Bar Prepares → Ready → SERVED → Appears on Guest Bill
  Tour Booked  → Confirmed → COMPLETED by admin → Appears on Guest Bill  
  
Pre-Checkout:
  1. Housekeeper inspects room → marks "No Damages" or flags issues
  2. Guest reviews bill on portal → taps "I Agree"  
  3. Receptionist opens Checkout Modal → sees checklist:
     [✓] All orders served/settled
     [✓] Tours & experiences completed  
     [✓] Room cleared by housekeeping
     [✓] Guest agreed to bill
  4. Receptionist confirms checkout → batch settlement
```

