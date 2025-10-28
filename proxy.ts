import { updateSession } from '@/utils/supabase/middleware';

export { updateSession as proxy };

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|auth|error|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
