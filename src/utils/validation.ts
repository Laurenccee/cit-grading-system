/**
 * Validation schemas for forms and data
 * Uses Zod for runtime type validation
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION VALIDATION
// ============================================================================

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export type LoginFormType = z.infer<typeof LoginFormSchema>;

// ============================================================================
// CLASS VALIDATION
// ============================================================================

export const ClassFormSchema = z.object({
  subject_code: z
    .string()
    .min(1, 'Subject code is required')
    .max(10, 'Subject code must be 10 characters or less'),
  subject_name: z
    .string()
    .min(1, 'Subject name is required')
    .max(100, 'Subject name must be 100 characters or less'),
  course_id: z.string().min(1, 'Course is required'),
  major_id: z.string().min(1, 'Major is required'),
  section_id: z.string().min(1, 'Section is required'),
  year_level_id: z.string().min(1, 'Year level is required'),
});

export type ClassFormType = z.infer<typeof ClassFormSchema>;

// ============================================================================
// GRADE VALIDATION
// ============================================================================

export const GradeSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  score: z
    .number()
    .min(0, 'Score cannot be less than 0')
    .max(100, 'Score cannot exceed 100'),
  grade: z.enum(['A', 'B', 'C', 'D', 'F']).optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type GradeType = z.infer<typeof GradeSchema>;

// ============================================================================
// ATTENDANCE VALIDATION
// ============================================================================

export const AttendanceSchema = z.object({
  student_id: z.string().min(1, 'Student is required'),
  date: z.date().or(z.string().datetime()),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional(),
});

export type AttendanceType = z.infer<typeof AttendanceSchema>;

// ============================================================================
// VALIDATION HELPER
// ============================================================================

/**
 * Validate form data and return typed data or field errors
 * @example
 * const validation = validateFormData(LoginFormSchema, { email: '...', password: '...' });
 * if (validation.success) {
 *   console.log(validation.data);
 * } else {
 *   console.log(validation.errors);
 * }
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
):
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue: any) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { success: false, errors };
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
  return (
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
  );
};
