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

    const {
      booking_id,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
      id_photo_url,
    } = await request.json();

    if (!booking_id) {
      return new Response('Missing booking ID', { status: 400 });
    }

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('host_id', session.user.id)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { data: guest, error } = await supabase
      .from('guests')
      .insert({
        booking_id,
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
    console.error('Error creating booking host guest:', error);
    return new Response('Error creating booking host guest', { status: 500 });
  }
}