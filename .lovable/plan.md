
# Add Messenger Username to Employee Creation Form

## Current State
- The `messenger_link` column already exists in the `employees` table -- no schema change needed
- The **contact edit** form (pencil icon > phone icon) already has a Messenger input field
- The **Payroll Dashboard** already shows a Messenger icon that links to `https://m.me/{username}` when the field is filled
- The **employee creation form** (at the bottom of the employee list) does NOT include a Messenger field

## Changes

### 1. Add Messenger field to employee creation form (PayrollDashboard.tsx)
- Add a new state variable `newMessenger` for the creation form
- Add an Input field labeled "Messenger username" in the add-employee row
- Include `messenger_link` in the `insertData` when creating a new employee
- Clear the field after successful creation

### 2. Improve label clarity
- Update the contact edit placeholder from "Messenger link/username" to "Messenger username" for consistency

### Technical Details
- Single file change: `src/components/admin/PayrollDashboard.tsx`
- No database migration needed -- `messenger_link` column already exists
- No new dependencies
