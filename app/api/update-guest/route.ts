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
      id,
      name,
      address,
      phone,
      nationality,
      passport_number,
      date_of_birth,
    } = await request.json();

    const { data: guest } = await supabase
      .from('guests')
      .select('*, bookings(*)')
      .eq('id', id)
      .single();

    if (!guest) {
      return new Response('Guest not found', { status: 404 });
    }

    if (guest.bookings.host_id !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
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
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Guest updated successfully' });
  } catch (error) {
    console.error('Error updating guest:', error);
    return new Response('Error updating guest', { status: 500 });
  }
}