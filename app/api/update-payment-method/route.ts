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

    const { paymentMethodId } = await request.json();

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return new Response('Customer not found', { status: 404 });
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.stripe_customer_id,
    });

    await stripe.customers.update(customer.stripe_customer_id, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    return NextResponse.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    console.error('Error updating payment method:', error);
    return new Response('Error updating payment method', { status: 500 });
  }
}