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
      guest_id,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
    } = await request.json();

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

    const { error } = await supabase
      .from('guests')
      .update({
        name,
        address,
        phone,
        nationality,
        passport_number,
        date_of_birth,
      })
      .eq('id', guest_id)
      .eq('booking_id', booking.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guest updated successfully' });
  } catch (error) {
    console.error('Error updating booking guest:', error);
    return new Response('Error updating booking guest', { status: 500 });
  }
}