

## Add Service Charge Total to Reports Dashboard

### Why
Service charge (10%) is collected on every order and needs to be tracked for staff payroll, which is distributed every Saturday. Currently the reports calculate revenue/profit but don't surface the total service charge amount for the period.

### Changes

**File: `src/components/admin/ReportsDashboard.tsx`**

1. **Add service charge to stats calculation** (in the `stats` useMemo):
   - Sum `o.service_charge` across all orders for the period
   - Return `totalServiceCharge` alongside existing metrics

2. **Add a Service Charge summary card** to the dashboard:
   - New card in the summary grid showing total service charge with a receipt/banknote icon
   - Labeled "Service Charge (Payroll)" so it's clear what it's for

3. **Include service charge in CSV export**:
   - Add a `Total Service Charge` line in the summary section of the CSV
   - The per-transaction rows already include service charge -- no change needed there

### Technical Details

- In the `stats` useMemo (around line 136), add: `const totalServiceCharge = orders.reduce((s, o) => s + (o.service_charge || 0), 0);`
- Return it in the stats object
- Add a new summary card after the existing 4 cards (Revenue, Food Cost, Profit, Margin) -- will use a 2-column grid row or expand to 3 columns
- In `generateCSV()`, add `Total Service Charge,${stats.totalServiceCharge.toFixed(2)}` to the summary block

No database changes needed.

