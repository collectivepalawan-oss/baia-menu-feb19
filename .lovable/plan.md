

## Fresh Launch Data Reset

No code or functionality changes. Data-only operation using the database tool to clear all operational/transactional tables while preserving master configuration (rooms, menu, employees, settings).

### Tables to Clear

**Reservations & Guest Data:**
- `resort_ops_bookings` (cascades to guest_notes, guest_tours, room_transactions, guest_requests, guest_reviews, bill_disputes, tour_bookings)
- `guest_documents`
- `guest_vibe_records` → `interventions`

**Food & Beverage:**
- `orders`
- `tabs`
- `inventory_logs`

**Housekeeping:**
- `housekeeping_orders`

**Staff/Payroll:**
- `employee_shifts`
- `employee_tasks`
- `employee_bonuses`
- `payroll_payments`

**Finance:**
- `expenses` → `expense_history`

**System:**
- `audit_log`

### Post-Cleanup
- Reset all `units` status to `ready` so every room shows as available on launch day

### Preserved (untouched)
Units, room_types, resort_profile, menu_items, menu_categories, ingredients, employees, employee_permissions, billing_config, invoice_settings, payroll_settings, devices, order_types, payment_methods, app_options, cleaning_packages, housekeeping_checklists

### Execution Order
1. Delete `interventions` (FK to guest_vibe_records)
2. Delete `guest_vibe_records`
3. Delete `guest_documents`
4. Delete `inventory_logs`
5. Delete `expense_history` (FK to expenses)
6. Delete `expenses`
7. Delete `orders` (room_transactions cascade handled by bookings delete)
8. Delete `tabs`
9. Delete `resort_ops_bookings` (cascades: guest_notes, guest_tours, room_transactions, guest_requests, guest_reviews, bill_disputes, tour_bookings)
10. Delete `housekeeping_orders`
11. Delete `employee_shifts`, `employee_tasks`, `employee_bonuses`
12. Delete `payroll_payments`
13. Delete `audit_log`
14. Update all `units` → status = `ready`

Zero code changes. Only data operations.

