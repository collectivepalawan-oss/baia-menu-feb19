
Fix the OTA accommodation billing at the source, not just in the balance display.

1. Root cause confirmed
- The app still auto-posts an `accommodation` room transaction during check-in in `src/pages/ReceptionPage.tsx`.
- That posting happens for all bookings with a `room_rate`, including `Booking.com`, `Airbnb`, and `Agoda`.
- The later “Paid via platform” credit only adjusts totals; it does not stop the accommodation line itself from appearing in the folio, guest bill, checkout bill, and print bill.
- The uploaded screenshot matches this: OTA booking metadata is present, but the room charge is still being posted and shown everywhere.

2. Implementation change
- Update the check-in flow in `src/pages/ReceptionPage.tsx` so accommodation is only auto-posted for direct/manual stays.
- Keep auto-posting for walk-ins and direct bookings.
- Skip auto-posting when `platform` is an OTA (`Booking.com`, `Airbnb`, `Agoda`, and normalized variants).
- Reuse one shared helper/constant in the page for “is OTA prepaid accommodation” so the logic is consistent.

3. UI cleanup so OTA stays don’t show fake room debt
- `src/pages/GuestPortal.tsx`
  - Hide the “Stay Details” room total card for OTA stays.
  - Exclude `accommodation` rows from the “Room Charges” section for OTA stays.
  - Keep showing real extras only: adjustments, fees, tours, rentals, F&B.
  - Keep the “Paid via [platform]” line only if there is a real `paid_amount`.
- `src/components/rooms/RoomBillingTab.tsx`
  - Filter out `accommodation` ledger rows for OTA stays in the visible room charges list and summary.
- `src/components/rooms/CheckoutModal.tsx`
  - Same filtering so checkout only shows what is actually due on property.
- `src/components/rooms/PrintBill.tsx`
  - Same filtering so the printed bill does not list accommodation for OTA stays.

4. Backward-compatibility cleanup
- Because some OTA bookings already have bad accommodation entries from earlier check-ins, add defensive filtering in all billing views above so existing records stop showing as due.
- This avoids needing an immediate data migration and fixes both old and new OTA bookings in the UI.

5. Optional stronger follow-up after this fix
- Review reservation import/webhook paths (`ImportReservationsModal` and `sirvoy-webhook`) to ensure OTA bookings consistently carry normalized platform values and, when available, reliable `paid_amount`.
- If needed later, add an admin cleanup action to remove previously posted OTA accommodation transactions from historical folios.

6. Expected result
- Booking.com / Airbnb / Agoda guests will no longer see accommodation on their bill.
- Reception, checkout, printed bill, and guest portal will all agree.
- Direct / walk-in stays will continue to show accommodation normally.

Technical notes
- Current faulty source: `src/pages/ReceptionPage.tsx` check-in block around the auto-post `transaction_type: 'accommodation'`.
- Existing UI already tries to offset OTA payments with `effectivePrepayment`, but that is insufficient because the charge row itself still exists.
- Best rule: OTA booking = no accommodation ledger posting; only incidental on-property charges belong on the folio.
