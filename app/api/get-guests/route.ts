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
    const booking_id = url.searchParams.get('booking_id');

    if (!booking_id) {
      return new Response('Missing booking ID', { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    if (booking.host_id !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('booking_id', booking_id)
      .order('created_at', { ascending: false });

    return NextResponse.json(guests || []);
  } catch (error) {
    console.error('Error getting guests:', error);
    return new Response('Error getting guests', { status: 500 });
  }
}