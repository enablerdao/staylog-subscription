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

    const { id, status } = await request.json();

    const { data: booking } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('host_id', session.user.id)
      .single();

    if (!booking) {
      return new Response('Booking not found', { status: 404 });
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .eq('host_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return new Response('Error updating booking status', { status: 500 });
  }
}