import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { full_name, avatar_url, billing_address } = await request.json();

    const { error } = await supabase
      .from('users')
      .update({
        full_name,
        avatar_url,
        billing_address,
      })
      .eq('id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Host info updated successfully' });
  } catch (error) {
    console.error('Error updating booking host info:', error);
    return new Response('Error updating booking host info', { status: 500 });
  }
}