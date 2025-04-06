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

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('host_id', session.user.id);

    if (!bookings || bookings.length === 0) {
      return NextResponse.json([]);
    }

    const bookingIds = bookings.map((booking) => booking.id);

    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .in('booking_id', bookingIds)
      .order('created_at', { ascending: false });

    return NextResponse.json(guests || []);
  } catch (error) {
    console.error('Error getting booking host guests:', error);
    return new Response('Error getting booking host guests', { status: 500 });
  }
}