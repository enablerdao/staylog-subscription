import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response('Missing path', { status: 400 });
    }

    const { data, error } = await supabase.storage
      .from('id-photos')
      .createSignedUrl(path, 60);

    if (error) throw error;

    return NextResponse.json({ url: data.signedUrl });
  } catch (error) {
    console.error('Error getting storage URL:', error);
    return new Response('Error getting storage URL', { status: 500 });
  }
}