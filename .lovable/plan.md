

## Add Orders Pipeline to Staff View with Blinking New Order Indicator

### What We're Building
When staff enters the app (via passkey), they currently only see the menu + cart. We'll add a **bottom navigation bar** with two tabs: "Menu" and "Orders". The Orders view will show the same real-time kitchen pipeline as the admin dashboard (New, Preparing, Served, Paid), so staff and chefs can track orders without needing admin access.

New orders in the "New" status will have a **blinking indicator light** on the "Start Preparing" button that pulses until someone taps it, confirming the chef has seen the order.

### Changes

**1. Create a new `StaffOrdersView` component** (`src/components/staff/StaffOrdersView.tsx`)
- Reuses the existing `OrderCard` component
- Shows status tabs: New, Preparing, Served, Paid (today's orders only)
- Shows order count badges on each status tab
- Subscribes to Supabase Realtime for instant updates when orders change
- Calls the same `advanceOrder` function to move orders through the pipeline

**2. Update `OrderCard` component** (`src/components/admin/OrderCard.tsx`)
- When the order status is "New", add a CSS animation class to the "Start Preparing" button that makes a small indicator dot blink/pulse
- The blinking stops once the button is tapped (order moves to "Preparing")

**3. Add blinking animation to `src/index.css`**
- Add a `@keyframes blink-dot` animation for the pulsing indicator

**4. Update `MenuPage.tsx`** - Add bottom navigation for staff mode
- When `mode=staff`, show a fixed bottom nav bar with two tabs: "Menu" and "Orders"
- "Menu" shows the current menu browsing view
- "Orders" shows the `StaffOrdersView` component
- The "Orders" tab badge shows count of active (non-closed) orders
- When `mode=guest`, the bottom nav does not appear (guests don't see orders)

### Technical Details

**Bottom Navigation Layout (staff mode only):**
```text
+----------------------------------+
|         Menu Content             |
|    (or Orders Pipeline)          |
|                                  |
+----------------------------------+
| [  Menu  ] | [ Orders (3) ]     |  <-- fixed bottom nav, 44px+ height
+----------------------------------+
```

**Blinking indicator on "Start Preparing" button:**
- A small colored dot (8x8px) with `animate-pulse` plus a custom `animate-blink` that alternates opacity
- Only appears when `order.status === 'New'`
- Disappears once tapped (order advances to Preparing)

**Files to create:**
- `src/components/staff/StaffOrdersView.tsx` - Orders pipeline for staff

**Files to modify:**
- `src/pages/MenuPage.tsx` - Add bottom nav bar for staff, toggle between menu and orders views
- `src/components/admin/OrderCard.tsx` - Add blinking dot to "Start Preparing" button for New orders
- `src/index.css` - Add blink animation keyframes

**Realtime:** The `StaffOrdersView` will subscribe to the `orders` table via Supabase Realtime channel, same pattern as `AdminPage.tsx`.

