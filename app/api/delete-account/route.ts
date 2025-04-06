import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2023-10-16',
});

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
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (customer?.stripe_customer_id) {
      // Cancel all subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.stripe_customer_id,
      });

      for (const subscription of subscriptions.data) {
        await stripe.subscriptions.del(subscription.id);
      }

      // Delete customer
      await stripe.customers.del(customer.stripe_customer_id);
    }

    // Delete user data
    await supabase.from('users').delete().eq('id', session.user.id);
    await supabase.from('customers').delete().eq('id', session.user.id);

    // Delete auth user
    await supabase.auth.admin.deleteUser(session.user.id);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return new Response('Error deleting account', { status: 500 });
  }
}