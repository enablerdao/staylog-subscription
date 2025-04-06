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
    const url = new URL(request.url);
    const booking_code = url.searchParams.get('booking_code');
    const guest_id = url.searchParams.get('guest_id');

    if (!booking_code || !guest_id) {
      return new Response('Missing booking code or guest ID', { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', booking_code)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { data: guest } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guest_id)
      .eq('booking_id', booking.id)
      .single();

    if (!guest) {
      return new Response('Guest not found', { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error getting booking guest:', error);
    return new Response('Error getting booking guest', { status: 500 });
  }
}