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
      booking_code,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
      id_photo_url,
    } = await request.json();

    if (!booking_code) {
      return new Response('Missing booking code', { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_code', booking_code)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { data: guest, error } = await supabase
      .from('guests')
      .insert({
        booking_id: booking.id,
        name,
        address,
        phone,
        nationality,
        passport_number,
        date_of_birth,
        id_photo_url,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(guest);
  } catch (error) {
    console.error('Error creating booking guest:', error);
    return new Response('Error creating booking guest', { status: 500 });
  }
}