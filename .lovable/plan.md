

## Mobile-First Weekly Schedule Calendar -- Stacked Cards

### Problem
The mobile view currently only shows "Today's Schedule" with a few cards. The user wants the **full weekly calendar visible on mobile**, rendered as vertically stacked cards per day (no horizontal scrolling grid).

### Solution
Replace the mobile-only "Today's Schedule" view with a **full 7-day stacked calendar** that shows every day of the week as its own card section, with all employees' shifts listed vertically under each day. Admin can add, edit, and delete shifts directly from any day card.

### Mobile Layout (New)

**Header**: Week navigation (prev/next arrows, "Current Week" button, week range label), and a global "+ Add Shift" button.

**Body**: 7 stacked day cards, each showing:
- Day header: "Sun, Mar 1" (highlighted if today)
- Under each day: employee shift cards showing name + time range + edit/delete buttons
- If no shifts: "No shifts" label
- A small "+" button per day to quickly add a shift for that day

Each shift card has **edit** and **delete** action buttons (44px touch targets). Tapping an employee name still opens their full-week modal.

### Desktop Layout
Unchanged -- keeps the existing 7-column grid.

### Files to Update
1. **`src/components/admin/WeeklyScheduleManager.tsx`** -- Rewrite the `if (isMobile)` block to render the full week as stacked day cards instead of only today's shifts. Add week navigation (prev/next) to the mobile header. Keep the employee-week modal, shift modal, and delete confirmation as-is.

