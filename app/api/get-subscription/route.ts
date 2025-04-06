import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ subscription: null });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.stripe_customer_id,
      status: 'active',
      expand: ['data.default_payment_method'],
    });

    return NextResponse.json({
      subscription: subscriptions.data[0] ?? null,
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return new Response('Error getting subscription', { status: 500 });
  }
}