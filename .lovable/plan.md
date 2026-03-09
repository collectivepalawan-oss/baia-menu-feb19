

## Collapsible Completed Section + Unpaid Order Alerts

### What You Get
1. **Service Boards**: Collapsible "Completed" section at the bottom showing Served/Paid orders, decluttering active Kanban columns
2. **Guest Portal**: Bill view shows unpaid F&B orders with clear "Pending Payment" status
3. **Reception/Checkout**: Warning banner when guest has unpaid orders — prevents checkout until settled
4. **Admin visibility**: Dashboard indicator for rooms with outstanding order balances

### Implementation

**1. ServiceBoard.tsx — Collapsible Completed Section**
- Remove "Served" from main Kanban columns
- Add collapsible section at bottom: "Completed Today (X)" showing Served + Paid orders
- Uses Radix Collapsible component — collapsed by default
- Kitchen/Bar/Reception all use the same pattern

**2. GuestPortal.tsx — Unpaid Orders in Bill View**
- Query orders where `status NOT IN ('Paid', 'Cancelled')` AND `payment_type != 'Charge to Room'`
- Display these as "Pending Payment" items in the Bill tab
- For Room Charge orders: already show in room_transactions, no extra action

**3. CheckoutModal.tsx — Unpaid Order Guard**
- Fetch orders for this `room_id` where status = Served and `payment_type` is NOT Room Charge
- If unpaid orders exist, show warning banner: "⚠️ X unpaid orders totaling ₱Y"
- List them inline with quick "Mark Paid" action
- Block checkout button until all orders settled OR user acknowledges

**4. RoomsDashboard (optional enhancement)**
- Badge on room cards when unpaid orders exist for that room
- Quick visual cue for reception staff

### Files Changed
```
EDIT  src/components/service/ServiceBoard.tsx     — Add collapsible completed section
EDIT  src/pages/GuestPortal.tsx                   — Show unpaid orders in Bill view
EDIT  src/components/rooms/CheckoutModal.tsx      — Unpaid order warning + guard
```

### Technical Details
- Collapsible uses `@radix-ui/react-collapsible` (already installed)
- Unpaid orders query: `status = 'Served' AND payment_type NOT IN ('Charge to Room')`
- Room Charge orders auto-transition to Paid, so they won't block checkout

