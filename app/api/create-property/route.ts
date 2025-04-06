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

    const { name, address } = await request.json();

    const { data: property, error } = await supabase
      .from('properties')
      .insert({
        name,
        address,
        owner_id: session.user.id,
        subscription_status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return new Response('Error creating property', { status: 500 });
  }
}