
# Payroll Enhancement: Rate Types, Payday Settings, Bonuses, and Employee of the Month

## Overview

Enhance the payroll system with flexible pay rate options (per hour/day/month), configurable payday schedules, per-employee bonuses, and an "Employee of the Month" feature with a bonus amount factored into payroll calculations.

## Database Changes

### 1. Alter `employees` table

Add columns:
- `rate_type` (text, default `'hourly'`) -- values: `'hourly'`, `'daily'`, `'monthly'`
- `daily_rate` (numeric, default 0)
- `monthly_rate` (numeric, default 0)

The existing `hourly_rate` column stays. Admin picks which rate type applies per employee.

### 2. Alter `payroll_payments` table

Add column:
- `bonus_amount` (numeric, default 0) -- bonus included in this payment

### 3. New table: `employee_bonuses`

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| employee_id | uuid | NOT NULL |
| amount | numeric | 0 |
| reason | text | '' |
| bonus_month | date | NULL |
| is_employee_of_month | boolean | false |
| created_at | timestamptz | now() |

RLS: Public read/insert/update/delete (matching existing pattern).

### 4. New table: `payroll_settings`

Single-row settings table:

| Column | Type | Default |
|--------|------|---------|
| id | uuid | gen_random_uuid() |
| payday_type | text | 'weekly' |
| payday_day_of_week | integer | 6 (Saturday) |
| payday_days_interval | integer | 15 |
| eom_bonus_amount | numeric | 0 |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

`payday_type` values: `'weekly'`, `'bimonthly'` (every 15 days), `'monthly'` (every 30 days).

RLS: Public read/insert/update.

## File Changes

### 1. `src/components/admin/PayrollDashboard.tsx`

**Employees sub-view changes:**
- Add rate type selector (Per Hour / Per Day / Per Month) next to each employee
- Show the relevant rate field based on selection (hourly_rate, daily_rate, or monthly_rate)
- Add a "Bonuses" section per employee showing pending bonuses
- Add inline bonus form: amount + reason + "Employee of the Month" toggle
- Display total bonuses pending for each employee

**Payroll settings section (new):**
- Add a settings area at the top or as a new sub-view tab
- Payday schedule selector: Weekly (pick day) / Every 15 Days / Every 30 Days
- Day-of-week picker (Mon-Sun) when weekly is selected
- Employee of the Month default bonus amount
- Pay period banner updates dynamically based on settings

**Summary sub-view changes:**
- Factor in bonuses when showing total earnings per employee
- Show bonus line items in employee summary
- Calculate daily/monthly rate employees differently:
  - Daily: count distinct work days x daily_rate
  - Monthly: monthly_rate (prorated if partial period)

**Payments sub-view changes:**
- Show bonus amount as separate line in payment records
- Include bonuses in payment totals

**CSV export:**
- Add bonus columns to export

### 2. `src/pages/EmployeePage.tsx`

- Update clock-out pay calculation to use the correct rate type
- For daily-rate employees: total_pay = daily_rate (flat per day, regardless of hours)
- For monthly-rate employees: total_pay = monthly_rate / working_days_in_month
- For hourly-rate employees: keep existing hours x rate logic

### 3. New hook: `src/hooks/usePayrollSettings.ts`

React-query hook to fetch/upsert the single row from `payroll_settings`.

## Technical Details

- Rate type logic: When `rate_type = 'daily'`, shift `total_pay` = `daily_rate` (one flat amount per calendar day worked, even with split shifts). When `rate_type = 'monthly'`, shift tracking is for attendance only; pay is calculated as `monthly_rate / working_days`.
- Pay period calculation changes from hardcoded Sunday-Saturday to dynamic based on `payroll_settings.payday_type` and `payday_day_of_week`.
- Employee of the Month: admin selects one employee per month via a toggle in the bonuses section. The `eom_bonus_amount` from `payroll_settings` is auto-populated but editable per instance.
- Bonuses are standalone records that get factored into the payroll summary but are separate from shift-based pay.
