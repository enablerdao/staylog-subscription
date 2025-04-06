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
      .select('id, id_photo_url')
      .in('booking_id', bookingIds)
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
    console.error('Error getting booking host guest photos:', error);
    return new Response('Error getting booking host guest photos', { status: 500 });
  }
}