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

    const formData = await request.formData();
    const guest_id = formData.get('guest_id') as string;
    const file = formData.get('file') as File;

    if (!guest_id || !file) {
      return new Response('Missing guest ID or file', { status: 400 });
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

    // Delete old photo if exists
    if (guest.id_photo_url) {
      await supabase.storage.from('id-photos').remove([guest.id_photo_url]);
    }

    // Upload new photo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${guest.booking_id}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('id-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Update guest record
    const { error: updateError } = await supabase
      .from('guests')
      .update({ id_photo_url: data.path })
      .eq('id', guest_id);

    if (updateError) throw updateError;

    return NextResponse.json({ path: data.path });
  } catch (error) {
    console.error('Error updating booking host guest photo:', error);
    return new Response('Error updating booking host guest photo', { status: 500 });
  }
}