

## Plan: Fix PIN Login + Add PIN Change for Admin & Staff

### Investigation Results
I tested the edge function directly — **Chef Jim's PIN 5309 works correctly** (returns 200 with employee data). The PIN was set successfully. The login failure you're seeing is likely a client-side error handling issue where the Supabase SDK sometimes wraps successful non-2xx responses incorrectly.

### Root Issues
1. **Login error handling is fragile** — the `EmployeePortal.tsx` login function has complex error extraction that can false-positive on successful responses
2. **No PIN change in Employee Portal Settings** — staff can't change their own PIN
3. **Admin PIN change is buried in Payroll Dashboard** — not intuitive; should also be accessible from Staff management

### Changes

**1. Fix login error handling** (`src/pages/EmployeePortal.tsx`)
- Simplify the login function: check `data?.employee` first (success path) before checking errors
- Add console logging for debugging failed attempts

**2. Add "Change PIN" to Employee Portal Settings tab** (`src/pages/EmployeePortal.tsx`)
- In the Settings tab, add a "Change PIN" section with:
  - Current PIN input (for verification)
  - New PIN input + Confirm PIN input
  - Calls edge function `verify` with current PIN first, then `set-password` with new PIN
  - Success toast + clear fields

**3. Add "Change PIN" to Admin Login Gate** (`src/components/admin/AdminLoginGate.tsx`)
- Ensure PIN button is visible and functional on admin employee cards (already exists in PayrollDashboard — verify it works)

### Files to Edit
1. `src/pages/EmployeePortal.tsx` — fix login handler + add PIN change in Settings
2. `supabase/functions/employee-auth/index.ts` — add `change-pin` action that verifies old PIN before setting new one

