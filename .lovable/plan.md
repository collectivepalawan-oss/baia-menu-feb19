

## Data Export and Archival System

### Part 1 — Archive Instead of Delete

**Database**: Add `archived_at` (timestamptz, nullable) column to `employee_tasks` via migration. No new tables needed.

**Code changes**:
- `src/components/employee/EmployeeTaskList.tsx`: Replace `deleteTask` hard-delete with a soft-archive (`update archived_at = now()`). Filter out archived tasks from the query (`archived_at IS NULL`). Add an "Archived" filter option alongside all/pending/completed.
- `src/components/admin/WeeklyScheduleManager.tsx`: Same change — archive instead of delete for tasks.

### Part 2 & 3 — Accounting Export

**New dependency**: `jszip` for client-side ZIP generation.

**New component**: `src/components/admin/AccountingExport.tsx`
- Date range selector: Weekly / Monthly / Custom (reuse the same pattern from ReportsDashboard)
- "Generate Accounting Export" button
- On click: query all relevant tables for the date range, generate CSV strings, bundle into ZIP via JSZip, trigger browser download
- Tables queried: `orders`, `tabs` + tab orders, `guest_tours`, `guest_requests`, `housekeeping_orders`, `employee_tasks`, plus revenue summary
- Each becomes a CSV file in the ZIP

**Integration**: Add an "Accounting Export" section at the bottom of `ReportsDashboard.tsx` (before the "Tours Revenue coming soon" section), rendering the new `AccountingExport` component.

### Part 4 — CSV Import (Basic)

Add an import button in the AccountingExport component that accepts CSV files, validates headers match expected structure, and can restore archived tasks by matching IDs and clearing `archived_at`.

### Part 5 — Storage Strategy

No structural change needed — archived records stay in the same tables with `archived_at` set. All active queries filter by `archived_at IS NULL`.

### Files to create/edit:
1. **Migration**: Add `archived_at` column to `employee_tasks`
2. **New**: `src/components/admin/AccountingExport.tsx`
3. **Edit**: `src/components/admin/ReportsDashboard.tsx` — add AccountingExport section
4. **Edit**: `src/components/employee/EmployeeTaskList.tsx` — archive logic + archived filter
5. **Edit**: `src/components/admin/WeeklyScheduleManager.tsx` — archive instead of delete
6. **Install**: `jszip` package

