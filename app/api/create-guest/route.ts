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
      booking_id,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
      id_photo_url,
    } = await request.json();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { error } = await supabase.from('guests').insert({
      booking_id,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
      id_photo_url,
    });

    if (error) throw error;

    return NextResponse.json({ message: 'Guest registered successfully' });
  } catch (error) {
    console.error('Error registering guest:', error);
    return new Response('Error registering guest', { status: 500 });
  }
}