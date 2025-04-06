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

    const { guest_id } = await request.json();

    if (!guest_id) {
      return new Response('Missing guest ID', { status: 400 });
    }

    const { data: guest } = await supabase
      .from('guests')
      .select('*, bookings(*)')
      .eq('id', guest_id)
      .single();

    if (!guest) {
      return new Response('Guest not found', { status: 404 });
    }

    if (guest.bookings.host_id !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!guest.id_photo_url) {
      return new Response('Guest has no ID photo', { status: 404 });
    }

    // Delete photo from storage
    await supabase.storage.from('id-photos').remove([guest.id_photo_url]);

    // Update guest record
    const { error } = await supabase
      .from('guests')
      .update({ id_photo_url: null })
      .eq('id', guest_id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guest photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking host guest photo:', error);
    return new Response('Error deleting booking host guest photo', { status: 500 });
  }
}