

## Add WhatsApp Integration to Team Contact

### What This Does
Adds a WhatsApp icon button next to each employee's name (like the existing Phone and Messenger icons), and a WhatsApp field in the Contact edit form. When tapped, it opens WhatsApp with a pre-formatted message containing the employee's tasks/schedule.

### Changes

#### 1. Add WhatsApp number field to Contact edit form (`PayrollDashboard.tsx`)
- Add a new state variable `editWhatsapp` for the WhatsApp number field
- Add a WhatsApp number input field in the contact edit section (alongside phone and messenger)
- Save the WhatsApp number to the employee record when saving contact info
- Pre-populate from `(emp as any).whatsapp_number` on edit

#### 2. Add WhatsApp icon button next to employee name
- Add a green WhatsApp icon (using MessageCircle or a custom icon) next to the existing Phone and Messenger icons in the employee row
- When tapped, it opens `https://wa.me/{number}?text={formatted_message}` with:
  - Employee greeting
  - Their pending tasks (fetched from the tasks table)
  - Their upcoming schedule/shift info
  - Resort name footer

#### 3. Add `whatsapp_number` column to employees table
- Database migration to add `whatsapp_number TEXT` column to the `employees` table

#### 4. Create WhatsApp message builder
- Add a helper function `buildTeamWhatsAppMessage(employee, tasks, shifts, resortName)` in `src/lib/messenger.ts` that formats a clean message with pending tasks and schedule data
- Reuses the existing `wa.me` URL pattern already used elsewhere in the app

### Files to Update
1. **Database migration** -- add `whatsapp_number` column to `employees`
2. **`src/components/admin/PayrollDashboard.tsx`** -- add WhatsApp field to contact form, WhatsApp icon button, and send functionality
3. **`src/lib/messenger.ts`** -- add `buildTeamWhatsAppMessage` helper

### How It Works for the Admin
1. Go to Team, tap "Contact" on an employee
2. Enter their WhatsApp number (with country code, e.g., +639171940917)
3. Save
4. A green WhatsApp icon appears next to the employee name
5. Tap it to open WhatsApp with a pre-filled message containing their tasks and schedule
