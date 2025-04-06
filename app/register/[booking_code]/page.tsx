import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Database } from '@/types_db';
import GuestRegistrationForm from '@/components/guests/guest-registration-form';

export default async function RegisterGuest({
  params: { booking_code }
}: {
  params: { booking_code: string };
}) {
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

  // 予約コードから予約情報を取得
  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_code', booking_code)
    .single();

  if (!booking) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Guest Registration</h1>
      <p className="mb-4 text-gray-600">
        Please fill in your information for your stay.
      </p>
      <GuestRegistrationForm bookingId={booking.id} />
    </div>
  );
}