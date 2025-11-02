/**
 * Common utility functions for the application
 */

import type { LucideIcon } from 'lucide-react';

/**
 * Render a Lucide icon component with optional className
 */
export const renderIcon = (
  icon: LucideIcon | undefined | null,
  className?: string
) => {
  if (!icon) return null;
  return icon({ className });
};

/**
 * Format user's full name from first and last name
 */
export const formatFullName = (
  firstName?: string,
  lastName?: string
): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'User';
};

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 30): string => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * Check if array has children elements
 */
export const hasChildren = (item: any): boolean => {
  return Array.isArray(item.children) && item.children.length > 0;
};

/**
 * Get fallback avatar initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
