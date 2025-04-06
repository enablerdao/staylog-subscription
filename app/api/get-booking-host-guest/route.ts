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
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(request.url);
    const guest_id = url.searchParams.get('guest_id');

    if (!guest_id) {
      return new Response('Missing guest ID', { status: 400 });
    }

    const { data: guest } = await supabase
      .from('guests')
      .select('*, bookings(*)')
      .eq('id', guest_id)
      .single();

    if (!guest) {
      return new Response('Guest not found', { status: 404 });
    }

    if (guest.bookings.host_id !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error getting booking host guest:', error);
    return new Response('Error getting booking host guest', { status: 500 });
  }
}