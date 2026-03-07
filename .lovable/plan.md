

## Plan: Add Full Room Detail View to Reception Page

### Problem
The Reception page currently shows room cards with basic actions (check-in, check-out, payment, clean) but lacks the rich per-room detail tabs that the Rooms Dashboard has. Reception staff — who are the first to meet walk-in guests — cannot access:
- **Documents/Passports** — upload and view guest ID documents
- **Vibe Check-In** — record guest sentiment and personality signals
- **Guest Notes** — add/view notes about the guest
- **Tours** — book/view tours for the guest
- **Orders** — see room service orders
- **Billing** — full transaction ledger

These are all available in the RoomsDashboard component (`src/components/admin/RoomsDashboard.tsx`) which already has all this functionality built with tabs: `info | orders | documents | notes | tours | vibe | billing`.

### Solution
Rather than duplicating all the RoomsDashboard logic into ReceptionPage, embed the **RoomsDashboard component** directly into the Reception page as a room detail view that opens when a receptionist taps on an occupied room card.

### Changes

**1. Reception Page — Add "View Room" action on each occupied room card** (`src/pages/ReceptionPage.tsx`)
- Add a button on each occupied room card (and ready rooms after walk-in check-in) to open a room detail panel
- When tapped, show the RoomsDashboard component in a Dialog/modal or inline expanded view, scoped to that specific unit
- Pass `readOnly` based on the staff's `reception` permission level (view vs edit)
- Pass `canViewDocuments` based on the staff's `documents` permission

**2. RoomsDashboard — Accept optional `initialUnit` prop** (`src/components/admin/RoomsDashboard.tsx`)
- Add an optional `initialUnit` prop so Reception can open it pre-focused on a specific room
- Add an optional `singleUnitMode` prop that hides the room grid and shows only the detail tabs for the given unit
- This avoids duplicating ~1000 lines of documents, vibe, notes, tours, billing logic

### Files to Edit
1. `src/pages/ReceptionPage.tsx` — add "Details" button on room cards, open RoomsDashboard in dialog with `singleUnitMode`
2. `src/components/admin/RoomsDashboard.tsx` — add `initialUnit` and `singleUnitMode` props to enable embedded use

