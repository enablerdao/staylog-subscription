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

    if (!booking_code) {
      return new Response('Missing booking code', { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*, users(*)')
      .eq('booking_code', booking_code)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    return NextResponse.json({
      name: booking.users.full_name,
      email: booking.users.email,
    });
  } catch (error) {
    console.error('Error getting booking host:', error);
    return new Response('Error getting booking host', { status: 500 });
  }
}