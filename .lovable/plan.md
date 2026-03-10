

## Plan: Manila Timezone Header, Room Protection, and Early/Late Fee Modals

### What exists now
- ReceptionPage already has: today arrivals/departures, week-ahead panel, walk-in sell, check-in/check-out modals, summary stats, upcoming booking indicators on room cards
- `today` is computed via `new Date().toISOString().split('T')[0]` (uses browser local time, not Manila-specific)
- Walk-in sell section shows ALL ready rooms including those with today arrivals
- No early check-in or late check-out fee handling
- No reservation protection on walk-in sell

### Changes — Single File

**`src/pages/ReceptionPage.tsx`**

#### 1. Manila Time Header
- Add a live clock (updates every second via `setInterval`) showing Manila time using `toLocaleString('en-PH', { timeZone: 'Asia/Manila' })` at the top of the page
- Also derive `today` from Manila timezone to avoid browser timezone issues

#### 2. Room Protection for Walk-In Sell
- Compute `todayReservedUnitIds`: set of unit IDs that have an arrival booking for today (not yet checked in)
- In the "Walk-In / Sell Room" section, split ready rooms into two groups:
  - **Truly available**: ready rooms with NO today arrival → show normal "Sell" button
  - **Reserved today**: ready rooms WITH a today arrival → show "Reserved for [Guest] at 2:00 PM" label, hide Sell button for non-admin, show "Override Sell" button for admin/manage with a reason field dialog

#### 3. Override Sell Dialog
- New state: `overrideReason`, `overrideOpen`, `overrideUnit`
- When admin clicks "Override Sell" on a reserved room, show a small dialog requiring a text reason
- On confirm, log the override reason to audit_log, then open the normal walk-in modal
- Reason is logged: `"Override sell: {reason} — reserved for {guest}"`

#### 4. Early Check-In Modal Enhancement
- In the existing check-in modal (`checkInModalOpen`), add:
  - A computed "is early" flag: if current Manila hour < 14 (2 PM)
  - If early, show an optional "Early Check-In Fee" input field (default ₱0)
  - If fee > 0, insert an additional `room_transactions` charge on check-in
  - Log to audit: "Early check-in fee: ₱X"

#### 5. Late Check-Out Modal Enhancement
- In the existing check-out modal (`checkOutOpen`), add:
  - A computed "is late" flag: if current Manila hour >= 12 (noon) AND it's the departure day
  - If late, show an optional "Late Check-Out Fee" input field (default ₱0)
  - If fee > 0, insert an additional `room_transactions` charge before completing checkout
  - Log to audit: "Late check-out fee: ₱X"

#### 6. Updated Summary Stats
- Change "Available" counter to show truly available rooms (ready minus reserved-today) to avoid confusion

### New State Variables
```
manilaTime (string, updated every second)
earlyCheckInFee (string, for check-in modal)
lateCheckOutFee (string, for check-out modal)
overrideOpen (boolean)
overrideUnit (any)
overrideReason (string)
```

### No Database Changes
All data already exists. Early/late fees go into `room_transactions`. Override reasons go into `audit_log`.

### Files
```
EDIT  src/pages/ReceptionPage.tsx
```

