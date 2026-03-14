

## Plan: Fix Billing Totals, Print Bill Item Labels, and Guest Portal Room Charges

### Problems Identified

1. **Print Bill doesn't show item descriptions** — Room ledger charges only show timestamp + amount (e.g., "3/14 10:52AM ₱6,500") with no label for what the charge is (Accommodation, Transport, Experience, etc.). The `notes` and `transaction_type` fields are available but not rendered.

2. **Print Bill balance doesn't include tours** — The balance calculation on line 35 is `totalCharges - totalPayments + fnbTotal` but does NOT add `toursTotal`. Tours render on the bill but don't affect the balance.

3. **Print Bill doesn't include guest requests (transport, bike rental)** — The `PrintBill` component receives `roomOrders` and `tours` props but has no `requests` prop. Transport, bike rentals, and other guest requests are completely absent from the printed bill.

4. **Guest Portal doesn't show room charges clearly** — The guest sees "Transactions" at the bottom which includes accommodation and room_charge entries, but these are labeled generically. The guest portal also doesn't show `room_charge` type transactions with their notes/descriptions prominently — they just show "room charge" with no context of what it's for.

### Changes

#### 1. `src/components/rooms/PrintBill.tsx`

- **Add `requests` prop** for guest requests data
- **Show item labels on charges** — Display `t.notes || t.transaction_type` next to each charge line instead of just the timestamp
- **Fix balance calculation** — Add `toursTotal` and requests total to the balance: `balance = totalCharges - totalPayments + fnbTotal + toursTotal + requestsTotal`
- **Add REQUESTS section** — New "TRANSPORT & RENTALS" section on the printed bill showing request type + details

#### 2. `src/components/rooms/RoomBillingTab.tsx`

- **Pass `requests` to `PrintBill`** — Add the `requests` prop when rendering `PrintBill` (lines 462, 473)
- **Fix balance calculation** — Currently `balance = totalCharges - totalPayments + unpaidOrdersTotal` but doesn't include tours or requests. Add tours total (non-cancelled, non-completed with price > 0) and active requests to the folio balance display in the summary section.

#### 3. `src/pages/GuestPortal.tsx`

- **Show room charges in a dedicated section** — Add a "Room Charges" section above Transactions that filters `room_charge` and `accommodation` type transactions and displays them with their notes/descriptions prominently (instead of buried in generic "Transactions")
- **Show adjustment transactions clearly** — Label adjustments with their notes so guests understand discounts/corrections

### Files to edit

| File | Change |
|------|--------|
| `src/components/rooms/PrintBill.tsx` | Add `requests` prop, show charge labels, fix balance, add requests section |
| `src/components/rooms/RoomBillingTab.tsx` | Pass `requests` to PrintBill |
| `src/pages/GuestPortal.tsx` | Add dedicated Room Charges section with clear labels |

