import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Database } from '@/types_db';
import BookingsList from '@/components/bookings/bookings-list';
import CreateBookingButton from '@/components/bookings/create-booking-button';

export default async function Bookings() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  );

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/signin');
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, guests(*)')
    .eq('host_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bookings Management</h1>
        <CreateBookingButton />
      </div>
      <BookingsList bookings={bookings || []} />
    </div>
  );
}