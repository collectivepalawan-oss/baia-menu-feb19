

## Employee Payroll and Clock-In System

### Overview
Add a full employee management and payroll system with clock-in/clock-out tracking, hourly pay rates, and payment recording. Accessible from a new "Employee" button on the home page (below Admin), protected by the same passkey (5309), and managed via a new "Payroll" tab in Admin.

### Database Tables (2 new tables)

**employees**
- id (uuid, PK)
- name (text) -- employee name
- hourly_rate (numeric) -- pay per hour
- active (boolean, default true)
- created_at (timestamptz)

**employee_shifts**
- id (uuid, PK)
- employee_id (uuid, FK -> employees)
- clock_in (timestamptz) -- when they clocked in
- clock_out (timestamptz, nullable) -- null = still clocked in
- hours_worked (numeric, nullable) -- auto-calculated on clock-out
- total_pay (numeric, nullable) -- hours x hourly_rate
- is_paid (boolean, default false) -- mark as paid
- paid_at (timestamptz, nullable)
- created_at (timestamptz)

Both tables get public RLS policies (matching the existing pattern in this project).

### New Pages and Components

**1. Home Page (`src/pages/Index.tsx`)**
- Add "Employee" button below the "Admin" button
- Uses same passkey dialog (add `'employee'` to passkeyMode union)
- On success, navigates to `/employee`

**2. Employee Clock-In Page (`src/pages/EmployeePage.tsx`)**
- New route `/employee`
- Shows list of active employees as cards
- Each card shows employee name, hourly rate, and current status (Clocked In / Clocked Out)
- "Clock In" button starts a shift (inserts into employee_shifts with clock_in = now)
- "Clock Out" button ends the shift (updates clock_out, calculates hours_worked and total_pay)
- Shows today's total hours for each employee
- Home button to go back

**3. Admin Payroll Tab (`src/pages/AdminPage.tsx`)**
- New "Payroll" tab alongside Setup, Menu, Orders, Reports
- Sub-sections:

  **a. Employee Management**
  - List of all employees with name, hourly rate, active toggle
  - Add new employee form (name + hourly rate)
  - Edit/delete employees (reuse EditableRow pattern)

  **b. Shift Log & Pay**
  - Date filter (Today, Yesterday, This Week, This Month, Custom) -- reuse same pattern as Reports
  - Stacked card layout (no tables!) showing each shift:
    - Employee name, clock-in time, clock-out time, hours worked, total pay
    - "Mark Paid" button per shift (sets is_paid=true, paid_at=now)
    - Badge showing Paid/Unpaid status
  - Summary card at top: Total Hours, Total Pay Due, Total Paid

  **c. Payroll Summary**
  - Per-employee breakdown: total hours, total earnings, amount paid, amount outstanding
  - "Mark All Paid" button per employee for bulk payment

### Route Changes (`src/App.tsx`)
- Add `/employee` route pointing to new `EmployeePage`

### Technical Details

- All layouts use stacked cards (no horizontal scroll)
- Follows existing design system: dark navy background, cream/beige typography, Playfair Display headers, Lato body text
- Clock-in/out uses realtime subscription for live status updates
- Hours calculation: `(clock_out - clock_in)` in hours, rounded to 2 decimal places
- Service charge from Reports can be cross-referenced with payroll for Saturday distribution

### Files to Create
- `src/pages/EmployeePage.tsx` -- clock-in/out interface
- `src/components/admin/PayrollDashboard.tsx` -- admin payroll management

### Files to Modify
- `src/pages/Index.tsx` -- add Employee button + passkey mode
- `src/pages/AdminPage.tsx` -- add Payroll tab
- `src/App.tsx` -- add /employee route

### Database Migration
- Create `employees` table with RLS
- Create `employee_shifts` table with RLS and FK to employees
