import { createClient } from '@supabase/supabase-js';

export function getStorageClient() {
  console.log('SUPABASE SERVER CLIENT CREATED');
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}
