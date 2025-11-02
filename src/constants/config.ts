/**
 * Application-wide configuration and constants
 */

/** Navigation URLs */
export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    HOME: '/',
  },
  PROTECTED: {
    DASHBOARD: '/dashboard',
    CLASSES: '/classes',
    SCHEDULE: '/schedule',
    GRADES: {
      ROOT: '/grades',
      RAW: '/grades/raw',
      TRANSMUTED: '/grades/transmuted',
      REPORTS: '/grades/reports',
    },
    ATTENDANCE: {
      ROOT: '/attendance',
      DAILY: '/attendance/daily',
      REPORTS: '/attendance/reports',
    },
  },
} as const;

/** UI Constants */
export const UI = {
  AVATAR_SIZE: {
    SM: 'h-8 w-8',
    MD: 'h-10 w-10',
    LG: 'h-12 w-12',
  },
  SIDEBAR_ICON_SIZE: 'size-4',
  DEFAULT_AVATAR_URL: '/avatars/shadcn.jpg',
  DEFAULT_USER_NAME: 'User',
  DEFAULT_EMAIL: 'No email',
} as const;

/** Error Messages */
export const ERRORS = {
  AUTH_REQUIRED: 'Authentication required',
  SIDEBAR_DATA_FAILED: 'Failed to load sidebar data',
  USER_NOT_FOUND: 'User not found',
  CLASS_LOAD_FAILED: 'Failed to load classes',
} as const;

/** Default pagination */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
} as const;
