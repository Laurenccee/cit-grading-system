# 📊 Supabase Schema Analysis & Improvements

**Current Status**: ⚠️ Sections not linked to Year Levels  
**Issue**: Loading sections indefinitely because filtering by `year_level_id` returns empty  
**Recommendation**: Redesign schema for better LMS functionality

---

## 🔴 Critical Issue Found

### The Problem

Your sections table has NO link to year_levels:

```sql
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  code text not null,                 -- e.g. 'A'
  name text not null,                 -- e.g. 'Section A'
  created_at timestamptz default now()
);
```

But your form is trying to filter sections by `year_level_id`:

```typescript
sections.filter((s) => s.year_level_id === selectedYear);
```

**Result**: ❌ Always empty, so sections never appear!

---

## ✅ Immediate Fix (Quick Solution)

### Option A: Simple Fix (If sections are global)

If sections A, B, C are used across ALL year levels, remove the year_level_id filtering:

**File**: `src/features/classes/components/classes-form/add-classes-form.tsx`

```typescript
// Remove year_level_id from query
supabase.from('sections').select('id, code, name')

// Remove filtering in dropdown
<SelectContent>
  {sections.map((section) => (
    <SelectItem key={section.id} value={section.id}>
      {section.code} — {section.name}
    </SelectItem>
  ))}
</SelectContent>
```

### Option B: Better Fix (Link sections to year levels)

Add `year_level_id` to sections table:

```sql
-- Add year_level_id column
alter table sections
add column year_level_id uuid references year_levels(id) on delete cascade;

-- Make code + year_level_id unique instead
alter table sections
drop constraint if exists sections_code_key;

alter table sections
add constraint sections_code_year_unique
unique(code, year_level_id);
```

Then keep the filtering logic as-is.

---

## 🎯 Recommended Schema Improvements

### 1. **Link Sections to Year Levels** (Essential)

```sql
-- Modify sections table
alter table sections
add column year_level_id uuid references year_levels(id) on delete cascade;

-- Add unique constraint
alter table sections
add constraint sections_code_year_unique
unique(code, year_level_id);

-- Add index for performance
create index sections_year_level_id_idx on sections(year_level_id);
```

**Why**: Sections should be specific to year levels (1st year has sections A,B,C; 2nd year has A,B,C)

---

### 2. **Add Attendance Table** (For Tracking)

```sql
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  date date not null,
  status text check (status in ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, class_id, date)
);

-- RLS for attendance
alter table attendance enable row level security;

create policy "Users can manage attendance for their classes"
on attendance
for all
using (
  exists (
    select 1 from classes c
    where c.id = attendance.class_id
    and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from classes c
    where c.id = attendance.class_id
    and c.user_id = auth.uid()
  )
);
```

---

### 3. **Add Grade Scales/Rubric Table** (Optional but helpful)

```sql
create table if not exists grade_scales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,  -- e.g., "Standard", "Rubric A"
  created_at timestamptz default now()
);

create table if not exists grade_scale_items (
  id uuid primary key default gen_random_uuid(),
  scale_id uuid references grade_scales(id) on delete cascade,
  min_score numeric not null,
  max_score numeric not null,
  grade text not null,  -- e.g., "A", "B", "1.0", "90-100"
  created_at timestamptz default now()
);

-- RLS
alter table grade_scales enable row level security;
alter table grade_scale_items enable row level security;

create policy "Users can manage their grade scales"
on grade_scales
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can manage items for their grade scales"
on grade_scale_items
for all
using (
  exists (
    select 1 from grade_scales gs
    where gs.id = grade_scale_items.scale_id
    and gs.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from grade_scales gs
    where gs.id = grade_scale_items.scale_id
    and gs.user_id = auth.uid()
  )
);
```

---

### 4. **Enhance Student Assessments** (Better grades tracking)

```sql
-- Current: student_assessments
-- Add these columns:
alter table student_assessments
add column if not exists submitted_at timestamptz,
add column if not exists graded_at timestamptz,
add column if not exists feedback text,
add column if not exists updated_at timestamptz default now();

-- Update trigger to handle updated_at
create or replace function update_student_assessments_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_student_assessments_timestamp_trigger
before update on student_assessments
for each row
execute function update_student_assessments_timestamp();
```

---

### 5. **Add Class Materials/Resources** (Content delivery)

```sql
create table if not exists class_materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  material_type text check (material_type in ('lecture', 'reading', 'assignment', 'resource')),
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table class_materials enable row level security;

create policy "Users can manage materials for their classes"
on class_materials
for all
using (
  exists (
    select 1 from classes c
    where c.id = class_materials.class_id
    and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from classes c
    where c.id = class_materials.class_id
    and c.user_id = auth.uid()
  )
);
```

---

### 6. **Add Announcements** (Communication)

```sql
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  priority text check (priority in ('low', 'normal', 'high')) default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table announcements enable row level security;

create policy "Users can manage announcements for their classes"
on announcements
for all
using (
  exists (
    select 1 from classes c
    where c.id = announcements.class_id
    and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from classes c
    where c.id = announcements.class_id
    and c.user_id = auth.uid()
  )
);
```

---

### 7. **Add Activity Log** (Audit trail)

```sql
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,  -- 'grade_submitted', 'attendance_marked', etc
  resource_type text not null,  -- 'assessment', 'attendance', 'class', etc
  resource_id uuid,
  changes jsonb,  -- Store before/after for auditing
  created_at timestamptz default now()
);

-- No RLS needed - instructor views their own logs
create index activity_logs_user_id_idx on activity_logs(user_id);
create index activity_logs_created_at_idx on activity_logs(created_at);
```

---

## 📋 Complete Improved Schema Summary

```
Users (auth.users)
├── Courses
│   └── Majors
│       └── Classes (many per major)
│           ├── Class Schedules
│           ├── Assessments
│           │   └── Student Assessments (Grades)
│           ├── Class Enrollments
│           │   └── Students
│           ├── Attendance
│           ├── Class Materials
│           └── Announcements
├── Year Levels
│   └── Sections (FIXED: now linked to year levels)
├── Grade Scales (optional but recommended)
│   └── Grade Scale Items
└── Activity Logs
```

---

## 🔧 Priority Implementation Order

### Phase 1: Fix Current Issue (NOW)

1. ✅ Fix section loading (use Option A or B above)
2. ✅ Test form works

### Phase 2: Essential Features (This Week)

1. Add Attendance table
2. Test attendance marking works
3. Add Activity Logs for audit trail

### Phase 3: Nice-to-Have Features (Next Week)

1. Grade Scales/Rubrics
2. Class Materials
3. Announcements

### Phase 4: Polish (Later)

1. Optimize queries with proper indexes
2. Add more triggers for data consistency
3. Add caching strategies

---

## 🚀 Quick Fixes for Immediate Issues

### Fix 1: Section Loading

**File**: `src/features/classes/data/dropdown.ts`

```typescript
// Option A: No year_level_id filtering needed
supabase.from('sections').select('id, code, name');

// Option B: Include year_level_id (after schema update)
supabase.from('sections').select('id, code, name, year_level_id');
```

### Fix 2: Section Dropdown UI

**File**: `src/features/classes/components/classes-form/add-classes-form.tsx`

```typescript
// Option A: Show all sections
<SelectContent>
  {sections.map((section) => (
    <SelectItem key={section.id} value={section.id}>
      {section.code} — {section.name}
    </SelectItem>
  ))}
</SelectContent>

// Option B: Filter by year_level (after schema update)
<SelectContent>
  {sections
    .filter((s) => s.year_level_id === selectedYear)
    .map((section) => (
      <SelectItem key={section.id} value={section.id}>
        {section.code} — {section.name}
      </SelectItem>
    ))}
</SelectContent>
```

---

## 📊 Comparison: Before vs After Schema

| Feature              | Before           | After        |
| -------------------- | ---------------- | ------------ |
| Sections per year    | ❌ Not supported | ✅ Supported |
| Attendance tracking  | ❌ No            | ✅ Yes       |
| Grade scales/rubrics | ❌ No            | ✅ Yes       |
| Class materials      | ❌ No            | ✅ Yes       |
| Announcements        | ❌ No            | ✅ Yes       |
| Audit trail          | ❌ No            | ✅ Yes       |
| RLS security         | ✅ Good          | ✅ Enhanced  |

---

## 💡 Best Practices Applied

✅ **Foreign Keys**: Proper referential integrity  
✅ **Cascade Deletes**: Clean up related records  
✅ **RLS Policies**: Row-level security for multi-tenant  
✅ **Unique Constraints**: Prevent duplicates  
✅ **Indexes**: Performance optimization  
✅ **Timestamps**: Audit trail (created_at, updated_at)  
✅ **Check Constraints**: Data validation at DB level

---

## 🎯 Questions to Consider

1. **Should sections be year-level specific?**

   - Yes (recommended): Use Option B
   - No (simpler): Use Option A

2. **Do you need grade scales?**

   - Per-class rubrics: Yes, add Grade Scales table
   - Standard grading: No, keep as-is

3. **Do you need class materials?**

   - For syllabus/notes: Yes, recommended
   - For grade-only LMS: No, skip

4. **Do you need announcements?**
   - For class communication: Yes, recommended
   - For grade tracking only: No, skip

---

## ✅ Summary

Your schema is **solid** for core LMS functionality! Main improvements:

1. ✅ Link sections to year levels (fixes current issue)
2. ✅ Add attendance tracking (critical for LMS)
3. ✅ Add class materials (helps content delivery)
4. ✅ Consider grade scales (flexible grading)
5. ✅ Add activity logs (audit trail)

Start with fixing the section issue, then add attendance next!

---

**Need help implementing any of these?** Let me know which option you want! 🚀
