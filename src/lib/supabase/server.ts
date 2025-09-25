import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: async (key: string, value: string, options: Record<string, unknown>) => {
          cookieStore.set({ name: key, value, ...options });
        },
        remove: async (key: string, options: Record<string, unknown>) => {
          cookieStore.set({ name: key, value: '', ...options });
        },
      },
    }
  );
}
