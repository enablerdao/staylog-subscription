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
      .eq('host_id', session.user.id)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { data: guests } = await supabase
      .from('guests')
      .select('id, id_photo_url')
      .eq('booking_id', booking_id)
      .not('id_photo_url', 'is', null);

    if (!guests || guests.length === 0) {
      return NextResponse.json([]);
    }

    const signedUrls = await Promise.all(
      guests.map(async (guest) => {
        const { data } = await supabase.storage
          .from('id-photos')
          .createSignedUrl(guest.id_photo_url, 60);
        return {
          guest_id: guest.id,
          url: data?.signedUrl,
        };
      })
    );

    return NextResponse.json(signedUrls.filter((url) => url.url));
  } catch (error) {
    console.error('Error getting booking host guest photos by booking:', error);
    return new Response('Error getting booking host guest photos by booking', { status: 500 });
  }
}