

# Remove WhatsApp Dependency -- Direct Kitchen Orders

## The Problem
Right now, when a guest or staff places an order, the app opens WhatsApp to send the order details to the kitchen tablet. This is confusing -- the guest has to leave the ordering app, open WhatsApp, and hit send. It's an extra step that breaks the flow and can lead to missed orders.

## The Solution
**Remove the WhatsApp redirect entirely.** The order is already being saved to the database (and the kitchen tablet already receives it in real-time via the Admin Orders pipeline). WhatsApp is redundant.

Instead of opening WhatsApp after placing an order, the app will:
1. Save the order to the database (already happens)
2. Show a **confirmation screen** inside the app with order details, a checkmark animation, and a message like "Your order has been received!"
3. The kitchen tablet (Admin > Orders) already picks it up instantly via realtime -- no WhatsApp needed

**Optional: Keep WhatsApp as a backup notification** -- instead of forcing the user to open WhatsApp, send the notification silently via a backend function (no user interaction required). This can be added later if needed.

## What Changes

### 1. CartDrawer.tsx -- Remove WhatsApp redirect
- Remove the `window.open(url, '_blank')` WhatsApp call after order submission
- Instead, show a success state inside the drawer with order confirmation details
- Add a brief confirmation view: checkmark icon, "Order Received!" message, order number, and a "Done" button that closes the drawer

### 2. CartDrawer.tsx -- Simplify validation
- Remove the check for `kitchen_whatsapp_number` being configured (no longer blocking)
- The settings query can stay for future use but is no longer required for order submission

### 3. Optional cleanup
- `src/lib/order.ts` -- Keep the file for now (the formatting functions could be reused for future receipt/print features), but it's no longer called from the cart flow

### 4. Confirmation UX
After tapping "Send to Kitchen":
- Button shows a loading spinner briefly
- Drawer content transitions to a confirmation view:
  - Checkmark icon
  - "Order Sent to Kitchen!"
  - Summary: order type, location, item count, grand total
  - "Place Another Order" button (closes drawer, stays on menu)
  - "Done" button (navigates back to home)

## Technical Details

**CartDrawer.tsx changes:**
- Add a `submitted` state that toggles to `true` after successful database insert
- When `submitted === true`, render the confirmation view instead of the item list
- Remove the WhatsApp URL construction and `window.open` call
- On drawer close or "Place Another Order", reset `submitted` to `false`
- Keep `cart.clearCart()` on successful submission

**No database changes needed** -- the realtime pipeline already delivers orders to the kitchen tablet instantly.

**No new files needed** -- this is a simplification, not an addition.

