/**
 * Icon mapping for sidebar components
 * Centralizes all Lucide icon imports for consistency and maintainability
 */

import {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  LayoutDashboard,
  BookOpen,
  Fingerprint,
  CalendarDays,
  Users,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  LayoutDashboard,
  BookOpen,
  Fingerprint,
  CalendarDays,
  Users,
};

/** Get icon component by name */
export const getIcon = (name: keyof typeof ICON_MAP): LucideIcon | null => {
  return ICON_MAP[name] || null;
};

/** Check if icon name exists */
export const isValidIconName = (
  name: string
): name is keyof typeof ICON_MAP => {
  return name in ICON_MAP;
};
