

## Clear Practice Data — Fresh Start

This is a **data-only** operation. No code or functionality will be touched.

### Tables to Clear (Operational Data)

Using DELETE statements via the data tool to wipe all practice records:

1. **Room Transactions** — `room_transactions` (depends on orders/bookings)
2. **Inventory Logs** — `inventory_logs` (linked to orders)
3. **Orders** — `orders` (all F&B orders)
4. **Tabs** — `tabs` (open tabs)
5. **Reservations** — `resort_ops_bookings` (all room bookings — CASCADE will auto-remove guest_tours, guest_requests, guest_reviews, guest_notes, guest_documents linked by booking_id)
6. **Housekeeping Orders** — `housekeeping_orders` (cleaning orders tied to rooms)
7. **Bill Disputes** — `bill_disputes`
8. **Guest Vibe Records & Interventions** — `interventions`, `guest_vibe_records`
9. **Audit Log** — `audit_log` (practice audit entries)

### What is NOT touched
- **Units / Rooms** (`units`) — room setup stays
- **Menu Items & Categories** — food menu stays
- **Employees & Permissions** — staff accounts stay
- **Resort Profile, Billing Config, Invoice Settings** — all config stays
- **Ingredients** — master ingredient list stays (stock levels reset via inventory_logs clearing)
- **All code files** — zero changes

### Deletion Order
Must delete in dependency order to avoid constraint errors:
1. `interventions`, `inventory_logs`, `room_transactions`, `bill_disputes`
2. `orders`, `tabs`
3. `housekeeping_orders`, `guest_vibe_records`
4. `resort_ops_bookings` (cascades guest_tours, guest_requests, guest_reviews, guest_notes, guest_documents)
5. `audit_log`

Single-file, zero-code operation — just database DELETE statements.

