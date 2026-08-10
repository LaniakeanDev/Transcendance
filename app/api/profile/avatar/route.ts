import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getStorageClient } from '@/lib/supabase-storage';

const MAX_SIZE = 500 * 1024; // 500KB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATARS_PUBLIC_PREFIX = '/storage/v1/object/public/avatars/';

function extractAvatarStoragePath(url: string): string | null {
  const idx = url.indexOf(AVATARS_PUBLIC_PREFIX);
  if (idx === -1) return null;
  return url.slice(idx + AVATARS_PUBLIC_PREFIX.length);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File too large (max 500KB)' },
      { status: 400 }
    );
  }

  const supabase = getStorageClient();
  const ext = file.name.split('.').pop();
  const path = `${user.id}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);

  const oldPath = user.avatarUrl
    ? extractAvatarStoragePath(user.avatarUrl)
    : null;
  if (oldPath && oldPath !== path) {
    await supabase.storage.from('avatars').remove([oldPath]);
  }

  return NextResponse.json({ url: data.publicUrl });
}
