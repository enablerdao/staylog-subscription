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
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response('Missing property ID', { status: 400 });
    }

    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('owner_id', session.user.id)
      .single();

    if (!property) {
      return new Response('Property not found', { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error getting property:', error);
    return new Response('Error getting property', { status: 500 });
  }
}