

## Timeline Schedule View for Admin

### Overview
Replace the current weekly schedule grid with an interactive horizontal timeline view (5 AM - 10 PM) where shifts appear as colored blocks spanning time columns. Each employee gets their own row. The view keeps the dark navy theme and is fully editable (tap to edit, add, delete).

### Layout

**Desktop**: Full timeline visible (5 AM - 10 PM) with employee rows, shift blocks span across hour columns. Hover reveals edit/delete actions.

**Mobile**: Horizontal scrollable timeline within each day card. Each day is a vertically stacked card (consistent with current mobile-first pattern). Inside each card, a compact timeline shows shift blocks that can be tapped to edit.

### Day Navigation
- Tabs or horizontal day selector at the top showing the 7 days of the week
- Tap a day to view that day's timeline
- Week prev/next arrows and "Current Week" button remain
- "Today" highlighted with accent color

### Timeline Grid
- Hours from 5:00 AM to 10:00 PM across X-axis (18 columns)
- Each employee as a row on Y-axis
- Shift blocks rendered as colored bars spanning from time_in to time_out
- Shift type tags (Morning, Evening, Maintenance) shown as small labels inside blocks
- Color coding: Morning = blue/accent, Evening = purple, Maintenance = green, Broken = orange
- Empty areas are tappable to add a new shift at that time slot

### Shift Blocks
- Semi-transparent colored backgrounds with light text
- Minimum height 44px for touch targets
- Tap block to open edit modal (pre-filled)
- "+" button at the end of each employee row
- Desktop: hover shows edit/delete icons overlay
- Slight elevation on hover (desktop)

### Shift Modal Enhancements
- Shift type/tag selector (Morning, Evening, Maintenance, Custom)
- Overlap validation: warn if new shift overlaps existing one for same employee/date
- "Duplicate to next day" option
- "Copy previous week" button in the header area

### Context Menu
- Desktop: right-click on shift block shows context menu (Edit, Duplicate, Delete, Assign to another employee)
- Mobile: long-press on shift block shows same options via a bottom sheet dialog

### Copy/Duplicate Features
- "Copy Previous Week" button in header duplicates all shifts from prior week
- "Duplicate Shift" in context menu copies shift to next day for same employee
- Bulk select mode: toggle to select multiple shifts, then bulk delete or bulk reassign

### Real-time Updates
- Existing real-time subscription pattern maintained
- Changes reflect immediately in the timeline

### Files to Change

1. **`src/components/admin/WeeklyScheduleManager.tsx`** -- Complete rewrite:
   - New timeline grid component with hour columns (5AM-10PM)
   - Day selector tabs at top
   - Employee rows with colored shift blocks
   - Shift type color coding and tags
   - Context menu (right-click desktop, long-press mobile)
   - Copy previous week functionality
   - Duplicate shift functionality
   - Overlap validation in shift modal
   - Mobile: horizontally scrollable timeline inside stacked day cards
   - Desktop: full timeline grid visible

2. **No database changes needed** -- existing `weekly_schedules` table has all required fields (employee_id, schedule_date, time_in, time_out)

### Technical Details
- Timeline positioning calculated from time_in/time_out as percentages of the 5AM-10PM range (17 hours)
- Shift blocks use `position: absolute` within a `position: relative` row container
- CSS `overflow-x: auto` for mobile horizontal scroll
- `onContextMenu` for desktop right-click, `onTouchStart`/`onTouchEnd` timer for mobile long-press
- Shift type inferred from time_in/time_out matching presets, stored as visual tag only (no schema change)
- Color map: `{ Morning: 'bg-blue-500/30', Evening: 'bg-purple-500/30', Maintenance: 'bg-green-500/30', Broken: 'bg-orange-500/30', Custom: 'bg-accent/20' }`

