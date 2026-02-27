

# Fix Room Order Type Label and Improve Chef Documentation

## Problem
- The order type is labeled "Room Delivery" but should just reflect the unit/room name since these are guest units, not delivery runs
- Scheduled breakfast orders taken the night before need to be clearly documented for the chef in the morning
- The WhatsApp message and order cards need to prominently show the unit name + scheduled time so the chef knows exactly what to prepare and when

## Changes

### 1. Rename "Room Delivery" to "Room" in order_types table
- Update the label from "Room Delivery" to "Room" in the database

### 2. Update labels in CartDrawer.tsx
- Change the `TYPE_LABELS` map entry from `Room: 'Room Delivery'` to `Room: 'Room'`
- Change the "Delivery Time" heading to "Scheduled Time" (since it's not always a "delivery")

### 3. Update labels in order.ts (WhatsApp message)
- Change the type label from `Room: 'Room Delivery'` to `Room: 'Room'`
- Change `*Scheduled Delivery:*` to `*Scheduled for:*`
- Make the WhatsApp message more chef-friendly: include unit name prominently at the top when scheduled, e.g.:
  ```
  SCHEDULED ORDER - Unit 3
  Tomorrow 7:00 AM
  ```

### 4. Improve OrderCard.tsx scheduled badge
- Make the scheduled badge more prominent for the chef -- show unit name + time together clearly
- For scheduled orders, change the card header to emphasize "SCHEDULED" similar to how "NEW ORDER" is emphasized
- Show the scheduled time in a more readable format, e.g. "Tomorrow 7:00 AM - Unit 3"

### 5. StaffOrdersView - ensure scheduled orders are visible
- Check that staff orders view properly surfaces scheduled orders so the chef sees them in the morning

## Technical Details
- Database update: `UPDATE order_types SET label = 'Room' WHERE type_key = 'Room'`
- No schema changes needed -- the `scheduled_for` column already exists
- All label changes are in 3 files: CartDrawer.tsx, order.ts, OrderCard.tsx
- The WhatsApp message format change makes it scannable for the chef preparing morning orders

