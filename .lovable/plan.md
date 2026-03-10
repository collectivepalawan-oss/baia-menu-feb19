

## Wire DineIn / Friends&Family / Room Delivery Orders to Guest Billing

### Problem
When staff selects "Dine-In Guest" with a unit (e.g., "Double Room #3") and table (e.g., "Table 2"), the system combines them into `"Double Room #3 – Table 2"` as the `location_detail`. In CartDrawer, the room linkage code tries `units.find(u => u.unit_name === selectedLocation)` — this fails because `selectedLocation` is the combined string, not the raw unit name. Result: `room_id` is null, guest portal never shows these orders, and no room transaction is created.

The same applies to "Friends&Family staying" and "Room Delivery" — any order type that maps to a unit needs to reliably link to the guest's room.

### Solution

**1. Pass `roomName` as a separate URL parameter** (`src/pages/OrderType.tsx`)
- For DineIn: pass `roomName=Double Room #3` separately, keep `location=Double Room #3 – Table 2` for display
- For all unit-based order types (RoomDelivery, FriendsFamily, Room): pass `roomName` = the selected unit name
- This decouples the display location from the room linkage

**2. Use `roomName` for room matching in CartDrawer** (`src/components/CartDrawer.tsx`)
- Read `roomName` from search params (fallback to `selectedLocation` for backward compatibility)
- Use `roomName` instead of `selectedLocation` in the `units.find()` lookup on line 258
- This ensures `room_id` is always set correctly for unit-linked orders
- Guest name auto-population from active booking will also work correctly

**3. Auto-set payment type for room-linked orders** (`src/components/CartDrawer.tsx`)
- When a room is matched and the order type is DineIn/FriendsFamily/RoomDelivery, default payment to "Charge to Room" (staff can override)

### Flow After Fix
```text
Staff selects "Dine-In Guest" → picks "Double Room #3" + "Table 2" + "Le"
  → URL: /menu?orderType=DineIn&location=Double Room #3 – Table 2&roomName=Double Room #3&guestName=Le
  → CartDrawer matches roomName → finds unit → sets room_id ✓
  → Creates room_transaction → appears on guest portal bill ✓
  → Guest sees order in real-time on their portal ✓
```

### Files to Edit
1. `src/pages/OrderType.tsx` — Pass `roomName` param for all unit-linked order types
2. `src/components/CartDrawer.tsx` — Read `roomName` param, use it for room matching instead of `selectedLocation`

