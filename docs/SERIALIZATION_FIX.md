# Serialization Error Fix - Documentation

## Problem Summary

After refactoring the codebase to improve type safety, a critical architectural error was introduced: React components were being serialized across the Server/Client component boundary, violating Next.js 16 architecture rules.

### Error Messages

```
Error: Only plain objects can be passed to Client Components from Server Components.
Classes or other objects with methods are not supported.
  {name: ..., logo: {$$typeof: ..., render: ...}, plan: ...}

Error: Functions cannot be passed directly to Client Components unless you explicitly
expose it by marking it with "use server".
  {$$typeof: ..., render: function GalleryVerticalEnd}
```

### Affected Icons

- GalleryVerticalEnd
- LayoutDashboard
- Users
- BookOpen
- Fingerprint
- CalendarDays
- AudioWaveform
- Command

---

## Root Cause Analysis

### The Problem Flow

1. **`src/types/sidebar.ts`** defined icon types as `LucideIcon` (React component type)
2. **`src/data/sidebar-data.ts`** (Server Component) fetched data and passed `ICON_MAP.GalleryVerticalEnd` (actual React component)
3. **`src/components/layouts/app-sidebar.tsx`** (Client Component) received the object containing React components
4. React tried to serialize components across the boundary → **ERROR**

### Original Code (Problematic)

```typescript
// src/data/sidebar-data.ts (SERVER COMPONENT)
const sidebarData: SidebarData = {
  teams: [
    {
      name: 'Faculty Portal',
      logo: ICON_MAP.GalleryVerticalEnd,  // ❌ React component - CANNOT SERIALIZE
      plan: 'Academic',
    },
  ],
  navMain: [
    {
      group: 'Home',
      icon: ICON_MAP.LayoutDashboard,     // ❌ React component - CANNOT SERIALIZE
      items: [...],
    },
    // ... more groups with components
  ],
};

// src/components/layouts/app-sidebar.tsx (CLIENT COMPONENT)
React.createElement(activeTeam.logo, { className: 'size-4' })  // ❌ Trying to use component that was serialized
```

---

## Solution Implemented

### Strategy: String-Based Icon Names

Instead of passing React components through the boundary, pass **string icon names** and resolve them on the client side.

### Changes Made

#### 1. Updated Type Definitions (`src/types/sidebar.ts`)

**Added:** `IconName` union type with all available icon names as string literals

```typescript
export type IconName =
  | 'GalleryVerticalEnd'
  | 'AudioWaveform'
  | 'Command'
  | 'LayoutDashboard'
  | 'BookOpen'
  | 'Fingerprint'
  | 'CalendarDays'
  | 'Users';
```

**Changed:** All icon fields from `LucideIcon` to `IconName`

```typescript
export interface Team {
  name: string;
  logo: IconName; // ✅ STRING instead of LucideIcon
  plan: string;
}

export interface SidebarGroup {
  group: string;
  icon?: IconName; // ✅ STRING instead of LucideIcon
  items: SidebarNavItem[];
}

export interface SidebarNavItem {
  title: string;
  url: string;
  icon?: IconName; // ✅ STRING instead of LucideIcon
  children?: SidebarNavItem[];
}
```

#### 2. Updated Server Data (`src/data/sidebar-data.ts`)

**Changed:** Pass icon name strings instead of components

```typescript
const sidebarData: SidebarData = {
  user: {
    /* ... */
  },
  teams: [
    {
      name: 'Faculty Portal',
      logo: 'GalleryVerticalEnd', // ✅ STRING - SERIALIZABLE
      plan: 'Academic',
    },
  ],
  navMain: [
    {
      group: 'Home',
      icon: 'LayoutDashboard', // ✅ STRING - SERIALIZABLE
      items: [
        { title: 'Dashboard', url: ROUTES.PROTECTED.DASHBOARD },
        // ...
      ],
    },
    {
      group: 'Classes',
      icon: 'Users', // ✅ STRING - SERIALIZABLE
      items: classItems,
    },
    // ... all other groups with string icon names
  ],
};
```

**Removed:** Unused ICON_MAP import

```typescript
// ❌ REMOVED
import { ICON_MAP } from '@/constants/icons';
```

#### 3. Updated Client Component (`src/components/layouts/app-sidebar.tsx`)

**Added:** Helper function to resolve icon names to components on client

```typescript
const renderIcon = (iconName: IconName | undefined, className: string) => {
  if (!iconName) return null;
  const Icon = getIcon(iconName as any);
  return Icon ? <Icon className={className} /> : null;
};
```

**Updated:** All icon rendering to use string names and resolution

```typescript
// Team logo (header)
{
  renderIcon(activeTeam.logo, 'size-4');
}

// Team dropdown
{
  renderIcon(team.logo, 'size-4 shrink-0');
}

// Section icons (Classes, Grades, Attendance, Schedule)
{
  renderIcon(section.icon, 'mr-2 size-4');
}

// ✅ NO MORE React.createElement() calls with components
```

**Changed imports:**

```typescript
// ❌ OLD
import { ICON_MAP } from '@/constants/icons';
import type { SidebarData, SidebarTeam, SidebarNavItem } from '@/types/sidebar';

// ✅ NEW
import { getIcon } from '@/constants/icons';
import type {
  SidebarData,
  SidebarTeam,
  SidebarNavItem,
  IconName,
} from '@/types/sidebar';
```

#### 4. Icons Utility Already Supported (`src/constants/icons.ts`)

This file already had the necessary helper function:

```typescript
export const getIcon = (name: keyof typeof ICON_MAP): LucideIcon | null => {
  return ICON_MAP[name] || null;
};
```

✅ No changes needed - client can use it to resolve names to components

---

## Architecture Diagram

### Before (Broken)

```
Server Component (sidebar-data.ts)
    ↓
    Passes: { logo: <GalleryVerticalEnd /> }  ❌ React component
    ↓
    Server → Client Boundary (VIOLATION)
    ↓
Client Component (app-sidebar.tsx)
    ↓
    Tries to use React component ❌ ERROR
```

### After (Fixed)

```
Server Component (sidebar-data.ts)
    ↓
    Passes: { logo: 'GalleryVerticalEnd' }  ✅ Plain string
    ↓
    Server → Client Boundary (VALID)
    ↓
Client Component (app-sidebar.tsx)
    ↓
    getIcon('GalleryVerticalEnd') → Returns React component
    ↓
    Renders component ✅ WORKS
```

---

## Files Modified

| File                                     | Changes                                                                    | Impact                                         |
| ---------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| `src/types/sidebar.ts`                   | Added `IconName` type; Changed icon fields from `LucideIcon` to `IconName` | Type safety maintained, serialization restored |
| `src/data/sidebar-data.ts`               | Pass icon name strings; Removed `ICON_MAP` import                          | Server component now serialization-safe        |
| `src/components/layouts/app-sidebar.tsx` | Added `renderIcon()` helper; Updated all icon rendering; Changed imports   | Client component properly resolves icons       |

---

## Testing Checklist

- [ ] No serialization errors in console
- [ ] All sidebar icons render correctly
- [ ] Team logo displays in header
- [ ] Team dropdown shows all teams with icons
- [ ] All navigation section icons appear (Home, Classes, Grades, Attendance, Schedule)
- [ ] Collapsible Classes section still functions
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## Benefits of This Approach

1. ✅ **Respects Next.js Architecture** - No components passed across boundaries
2. ✅ **Type Safe** - `IconName` union type provides autocomplete and type checking
3. ✅ **Maintainable** - Icon names are clear and self-documenting
4. ✅ **Scalable** - Easy to add new icons: just add to `IconName` type and `ICON_MAP`
5. ✅ **Efficient** - No unnecessary imports/serialization overhead
6. ✅ **Consistent** - Same pattern can be applied to other component props

---

## Related Documentation

- See `BEST_PRACTICES.md` for architectural guidelines
- See `REFACTORING.md` for context on the refactoring that introduced this issue
- See `INDEX.md` for project structure overview
