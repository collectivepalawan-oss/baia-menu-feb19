

## Fix Bill Dropdown, Show Service Charges, and Full Status Transparency

### Problems Identified

1. **Bill dropdown shows ₱0** — The balance calculation in `RoomBillingTab` counts `order.total` (which is only the subtotal), but excludes the `service_charge` field stored separately on each order. So the displayed folio balance is wrong.

2. **Service charge (10%) not visible per order** — Neither the billing tab nor the guest portal shows the service charge breakdown for F&B orders. Guests and staff can't see the 10% fee.

3. **Order status changes not reflected in billing** — When kitchen/bar marks an item as "Served" or "Ready", the billing tab and guest portal don't visually emphasize this. The status badge exists but there's no clear indication of what's billable vs still in progress.

4. **Guest portal bill missing service charge lines** — The `BillView` shows order totals but not the service charge or tax breakdown, making it non-transparent for guest approval.

5. **PrintBill only uses room_transactions** — It doesn't include unpaid F&B orders or their service charges in the printed bill, so the print is incomplete.

### Changes

**1. `src/components/rooms/RoomBillingTab.tsx`** — Fix balance + show service charge
- Fix `unpaidOrdersTotal` to include `service_charge`: `Number(o.total || 0) + Number(o.service_charge || 0)`
- Same fix for `paidOrders` total display
- Show service charge breakdown under each order: "Subtotal ₱X · SC 10% ₱Y · Total ₱Z"
- Show tax breakdown if `tax_details` exists on the order
- In the Summary section, add a "Service Charges" line
- Include `roomOrders` (all orders including charged-to-room) in the grand total calculation so the folio balance is accurate

**2. `src/pages/GuestPortal.tsx` (BillView)** — Full transparency
- Fix `unpaidOrdersTotal` to include service charge: `(o.total || 0) + (o.service_charge || 0)`
- Show per-order breakdown: subtotal, service charge (10%), and total
- Show confirmed/completed tours and requests in a "Completed" section (currently only pending ones show)
- Add completed tours query (status = 'completed') so guests see their finished experiences
- Show status badge more prominently with color and description text (e.g., "Being prepared by kitchen", "Ready for pickup", "Served ✓")

**3. `src/components/rooms/PrintBill.tsx`** — Include all charges in print
- Accept `roomOrders` as a prop and include unpaid F&B orders with service charges in the printed bill
- Show itemized F&B orders with service charge lines
- Show tours and requests in the printed bill

### Files to Edit
1. `src/components/rooms/RoomBillingTab.tsx` — Fix balance math, show SC per order
2. `src/pages/GuestPortal.tsx` — Fix balance math, show SC per order, add completed tours/requests
3. `src/components/rooms/PrintBill.tsx` — Include F&B orders and service charges in print output

