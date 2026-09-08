import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!supabase) {
    console.log('SUPABASE BROWSER CLIENT CREATED');

    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );
  }

  return supabase;
}
