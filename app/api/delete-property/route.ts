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

    const { id } = await request.json();

    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .single();

    if (!property) {
      return new Response('Property not found', { status: 404 });
    }

    // Delete all bookings and guests associated with the property
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', id);

    if (bookings) {
      for (const booking of bookings) {
        // Delete all guests associated with the booking
        await supabase.from('guests').delete().eq('booking_id', booking.id);

        // Delete the booking
        await supabase.from('bookings').delete().eq('id', booking.id);
      }
    }

    // Delete the property
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('owner_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return new Response('Error deleting property', { status: 500 });
  }
}