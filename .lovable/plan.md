

# Fix Permissions, Order Flow, and Navigation

## Overview
Three critical fixes: (1) Remove payment requirement for Walk-In/Dine-In orders, (2) Use existing permissions to control which navigation tiles staff can see, (3) Use permissions to control action buttons in Kitchen/Bar views.

## Changes

### 1. CartDrawer: Remove Payment Requirement for Walk-In and Dine-In
**File: `src/components/CartDrawer.tsx`**

- Change the payment section (lines 465-479) to only show for order types that need upfront payment (Room, Beach/Takeaway)
- Update the validation in `handleSendToKitchen` (line 131) to skip payment check for WalkIn and DineIn
- Walk-In and Dine-In orders will submit with empty `payment_type` (payment collected later at the register)

### 2. Index Page: Permission-Based Navigation Tiles
**File: `src/pages/Index.tsx`**

Currently, every logged-in staff member sees: Staff Order, Kitchen, Bar, Housekeeping, Employee Portal. This needs to be filtered using the existing `session.permissions` array.

New visibility rules using the existing permission system:
- **Staff Order**: Show if admin OR has `orders:view` or `orders:edit` permission
- **Kitchen**: Show if admin OR has `kitchen:view` or `kitchen:edit` permission (new permission key)
- **Bar**: Show if admin OR has `bar:view` or `bar:edit` permission (new permission key)
- **Housekeeping**: Show if admin OR has `housekeeping:view` or `housekeeping:edit` permission (new permission key)
- **Employee Portal**: Always visible (own timeclock/schedule)
- **Admin**: Only if `isAdmin` (unchanged)
- **Manager**: Only if non-admin with permissions (unchanged)

This uses the existing `hasAccess()` helper from `src/lib/permissions.ts` -- no database changes needed, just new permission keys assigned via the existing StaffAccessManager.

### 3. StaffAccessManager: Add Kitchen/Bar/Housekeeping Permission Keys
**File: `src/components/admin/StaffAccessManager.tsx`**

Add new entries to `GRANULAR_PERMISSIONS`:
- `{ key: 'kitchen', label: 'Kitchen Display' }`
- `{ key: 'bar', label: 'Bar Display' }`
- `{ key: 'housekeeping', label: 'Housekeeping' }` (already exists? checking... no, current list has `setup` for housekeeping config but not a `housekeeping` key)

These are added to the existing permission cycling UI (Off/View/Edit). No database migration needed -- the `employee_permissions` table already stores arbitrary permission strings.

### 4. DepartmentOrdersView: Permission-Based Action Buttons
**File: `src/components/DepartmentOrdersView.tsx`**

Read the session permissions from `sessionStorage` and use them to control:
- **"Start Preparing" button**: Only show if user has `kitchen:edit` (for kitchen) or `bar:edit` (for bar) or is admin
- **"Mark Ready" button**: Same as above
- Staff with `kitchen:view` or `bar:view` can SEE orders but NOT act on them (read-only display)

### 5. RequireAuth Enhancement
**File: `src/components/RequireAuth.tsx`** -- no changes needed. Route-level auth stays the same (any logged-in staff can access the route). The visibility control happens at the tile level on the Index page and button level in the department views.

---

## Technical Details

### Permission Keys (existing + new)

Existing keys already in `GRANULAR_PERMISSIONS`:
`orders`, `menu`, `reports`, `inventory`, `payroll`, `resort_ops`, `rooms`, `schedules`, `setup`, `timesheet`

New keys to add:
`kitchen`, `bar`, `housekeeping`

### No Database Migration Needed
The `employee_permissions` table stores `permission` as free-text. New keys like `kitchen:edit` are just new string values inserted via the existing StaffAccessManager UI.

### File Changes Summary

| File | Change |
|------|--------|
| `src/components/CartDrawer.tsx` | Hide payment selector and skip validation for WalkIn/DineIn |
| `src/pages/Index.tsx` | Filter navigation tiles based on `session.permissions` using `hasAccess()` |
| `src/components/admin/StaffAccessManager.tsx` | Add `kitchen`, `bar`, `housekeeping` to `GRANULAR_PERMISSIONS` |
| `src/components/DepartmentOrdersView.tsx` | Read session permissions; hide action buttons for view-only users |

