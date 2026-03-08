
## What needs to happen

The `ActionRequiredPanel` component was never actually built — only planned. The home screen wrappers (`ReceptionHome`, `KitchenHome`, `BarHome`, `HousekeepingHome`, `ExperiencesHome`, `StaffOrderHome`) are bare single-component wrappers with no layout of their own.

The cleanest approach: create the `ActionRequiredPanel`, then inject it at the **top of the StaffShell** before each role-specific home — this avoids touching 6 individual home files and keeps it DRY.

---

## Files to change

**1. Create `src/components/staff/ActionRequiredPanel.tsx`**

- Reads `emp_id` from `localStorage` and `permissions` from session storage
- Queries `employee_tasks` where `status != 'completed'` AND `archived_at IS NULL`
- Filtering:
  - Admin → all tasks
  - Staff → only tasks where `employee_id = emp_id`
- Sorts: overdue first → then high priority (tasks without due date but urgent) → then due today
- Limits to 5 results
- Each card shows:
  - Left colored bar: red = overdue, amber = due today, blue = default
  - Bold title
  - Assigned employee name (fetched from employees list joined via `employee_id`)
  - Due date label ("Overdue", "Due today", "Due MMM d")
  - Attachment badge if `completion_meta` has `image_url` (as proxy for attachments)
  - Comment count (using `description` length as a proxy — no separate comments table)
  - Action button: `status === 'in_progress'` → **Continue**, `status === 'pending'` → **Start Task**
  - Button click navigates to `/employee-portal` with the task pre-highlighted (or opens `TaskCompletionPanel` inline via a state callback)
- "View All Tasks" button → navigates to `/employee-portal`
- If 0 tasks: shows a clean "All clear" empty state (green checkmark, no card)

**2. Edit `src/pages/StaffShell.tsx`**

- Import `ActionRequiredPanel`
- Render it between the role switcher tabs and the role-specific home screen:

```text
[Header]
[Role Switcher Tabs]
<ActionRequiredPanel />          ← NEW: always visible above role content
[ReceptionHome / KitchenHome / ...]
```

No other files need to change. The existing home screens keep all their operational content below.

---

## Visual design

```text
┌─────────────────────────────────────┐
│ ACTION REQUIRED          View All > │
├─────────────────────────────────────┤
│ ▌ Fix leaking pipe in Cabin 3       │  ← red bar = overdue
│   Maintenance · Overdue · 📎        │
│                    [Start Task →]   │
├─────────────────────────────────────┤
│ ▌ Deep clean Room 5                 │  ← amber bar = due today
│   Housekeeping · Due today          │
│                    [Continue →]     │
└─────────────────────────────────────┘
```

Priority color key:
- Red left border → overdue
- Amber left border → due today
- Blue left border → in progress
- Gray → pending, no due date

---

## No database changes needed

`employee_tasks` already has: `id`, `title`, `description`, `status`, `due_date`, `employee_id`, `archived_at`, `completion_meta`

The query is a simple SELECT with filters — no migration required.
