

## Task Communication System — Plan

### Current State
- Tasks stored in `employee_tasks` table with `completion_meta` JSONB for completion proof
- `TaskCompletionPanel` handles completion with optional comment + image
- `TaskDetailsModal` shows task details in a dialog
- `EmployeeTaskList` renders task cards with edit/archive/complete actions
- No comment thread system exists — only a single completion comment

### Approach
Store comments in a new `task_comments` database table. This is the cleanest approach since JSONB arrays don't support pagination or independent queries. Use existing `receipts` storage bucket for image uploads.

---

### Database Migration

**New table: `task_comments`**

```sql
CREATE TABLE public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  image_url text,
  link_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Full CRUD policies (same pattern as employee_tasks)
CREATE POLICY "Public read task_comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Public insert task_comments" ON public.task_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete task_comments" ON public.task_comments FOR DELETE USING (true);
CREATE POLICY "Public update task_comments" ON public.task_comments FOR UPDATE USING (true) WITH CHECK (true);
```

No FK to employee_tasks since we use `as any` casting pattern throughout. The `author_name` stores the display name directly (same pattern as `guest_notes.created_by`).

---

### New Files

**1. `src/components/employee/TaskCommentThread.tsx`**

A self-contained comment thread component used inside task cards.

Props: `taskId`, `readOnly`, `authorName`, `maxComments` (default 10), `maxImages` (default 3)

Features:
- Fetches comments from `task_comments` where `task_id` matches
- Displays chronological list: author name, timestamp, text, optional image/link
- Add comment form: textarea + image upload button + URL input toggle
- Image upload uses `compressImage()` → uploads to `receipts` bucket under `task-comments/` path
- Enforces limits: shows "Comment limit reached" message when at 10 comments
- Counts existing images across all comments to enforce 3-image cap per task
- Comment count badge exposed via query for parent display

**2. `src/components/employee/TaskDetailSheet.tsx`**

Replaces the simple `TaskDetailsModal` with a richer bottom sheet (using Drawer/vaul) that contains:
- Task header: title (strikethrough if completed), assigned staff, due date, status badges
- Completion indicator: large green checkmark + completed_by + date/time (when completed)
- Activity history section: simple log derived from task metadata (created → assigned → completed) + comment timestamps
- Comment thread: embeds `<TaskCommentThread />`
- Admin actions (if not readOnly): Edit, Reassign, Archive, Delete buttons

This replaces `TaskDetailsModal` as the primary task detail view.

---

### Modified Files

**3. `src/components/employee/EmployeeTaskList.tsx`**

Changes:
- Import `TaskDetailSheet` instead of `TaskDetailsModal`
- Add comment count display on each task card (small `MessageCircle` icon + count)
- The Eye button and task tap now open `TaskDetailSheet` (not just for completed tasks — all tasks)
- Keep all existing functionality: edit inline, complete, archive, restore, messenger/whatsapp send

**4. `src/components/employee/TaskCompletionPanel.tsx`**

Minor change:
- Make completion comment required (not optional) — add validation that comment is non-empty before allowing confirm
- Apply `compressImage()` to the uploaded image

**5. `src/components/staff/ActionRequiredPanel.tsx`**

- Add comment count to the task query display (fetch from `task_comments` count or show a small badge)

---

### File Summary

```
MIGRATION: Create task_comments table with RLS
NEW:  src/components/employee/TaskCommentThread.tsx
NEW:  src/components/employee/TaskDetailSheet.tsx
EDIT: src/components/employee/EmployeeTaskList.tsx
EDIT: src/components/employee/TaskCompletionPanel.tsx
EDIT: src/components/staff/ActionRequiredPanel.tsx
```

### Limits Enforced
- Max 10 comments per task (client-side check before insert)
- Max 3 images per task across all comments (count query before allowing upload)
- Images compressed to ≤800KB via existing `compressImage()` utility
- Staff can comment + attach + complete; only admin/non-readOnly users can edit/delete/archive tasks (existing permission model preserved)

