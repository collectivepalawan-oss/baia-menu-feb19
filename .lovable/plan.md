

## Plan: Seamless Reception → Housekeeping → Ready Flow

### Problem
The current system has the pieces (checkout creates housekeeping orders, housekeeping inspection/cleaning marks rooms ready) but the **user experience is disconnected**:

1. **Reception checkout doesn't let you pick a housekeeper** — it silently creates a `pending_inspection` order with no assignment, so housekeepers don't know who should clean
2. **Housekeeping status on Reception page is buried** at the bottom in a collapsible section — staff must scroll to find it
3. **"To Clean" rooms on Reception show no progress** — no indication if someone accepted, is inspecting, or cleaning
4. **No notification to housekeeping** — checkout just creates a DB row; no WhatsApp/Messenger ping to the assigned housekeeper
5. **After cleaning completes, Reception has no feedback** — room silently becomes "Ready" but reception staff isn't notified

### Changes

**1. CheckoutModal: Add housekeeper assignment + notification** (`src/components/rooms/CheckoutModal.tsx`)
- Add a housekeeper picker dropdown (reuse employee query filtered to housekeeping staff) inside the checkout modal
- When checkout completes and housekeeping order is created, assign the selected housekeeper directly (`assigned_to`, `accepted_by`, `accepted_by_name`)
- After creating the order, auto-send WhatsApp/Messenger notification to the assigned housekeeper: "Room [X] needs cleaning — checked out by [staff]"
- Use the same messaging pattern from `lib/messenger.ts`

**2. Reception "To Clean" cards: Show live housekeeping progress** (`src/pages/ReceptionPage.tsx`)
- Currently "to_clean" rooms only appear in the Quick Room Status grid with tiny tiles. Add a dedicated **"🧹 Needs Cleaning"** section (above the collapsible tracker) showing each to_clean room as a full card with:
  - Assigned housekeeper name (or "Unassigned")
  - Current status badge: Pending → Inspecting → Cleaning → with color coding
  - Time since created (e.g. "15 min ago")
  - "Assign" button if unassigned (opens HousekeeperPickerModal)
  - "Send Reminder" button to re-ping the housekeeper via WhatsApp
- Remove the separate collapsible housekeeping tracker — merge it into this section for a single view

**3. ReceptionPage checkout: Also add housekeeper picker** (`src/pages/ReceptionPage.tsx`)
- The Reception page has its own inline checkout flow (lines 587-637). Add the same housekeeper picker here
- When checking out, assign the housekeeper and send notification

**4. Housekeeping completion → auto-notify reception** (`src/components/admin/HousekeepingInspection.tsx`)
- After `completeCleaning` sets room to "ready", show a toast on the housekeeper's screen confirming "Room ready — Reception notified"
- No code change needed for reception since queries auto-refresh every 15s, but reduce `refetchInterval` from 15s → 5s for faster feedback

**5. Simplify HousekeeperPage flow** (`src/pages/HousekeeperPage.tsx`)
- Make the "Accept with PIN" button larger and more prominent
- When an order has `assigned_to` matching the current employee, auto-highlight it as "Assigned to you" with a distinct color
- Add room priority visual: urgent orders at top with red border

### Files to Edit
1. `src/components/rooms/CheckoutModal.tsx` — housekeeper picker + notification on checkout
2. `src/pages/ReceptionPage.tsx` — dedicated "Needs Cleaning" section with live progress, housekeeper picker on checkout, faster refresh
3. `src/components/admin/HousekeepingInspection.tsx` — completion toast improvement
4. `src/pages/HousekeeperPage.tsx` — highlight assigned orders, larger accept button
5. `src/lib/messenger.ts` — add helper for housekeeping notification message (may already support it)

