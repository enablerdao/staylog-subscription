import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function BookingPage({
  params: { id }
}: {
  params: { id: string };
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

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/signin');
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, guests(*)')
    .eq('id', id)
    .eq('host_id', session.user.id)
    .single();

  if (!booking) {
    return redirect('/bookings');
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Booking Details
            </h1>
            <p className="text-gray-600">
              Booking Code: {booking.booking_code}
            </p>
            <p className="text-gray-600">
              Created: {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              booking.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {booking.status}
          </span>
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-medium mb-4">
            Registered Guests ({booking.guests.length})
          </h2>
          {booking.guests.length > 0 ? (
            <div className="space-y-4">
              {booking.guests.map((guest) => (
                <div
                  key={guest.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{guest.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {guest.nationality}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Passport: {guest.passport_number}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Date of Birth: {guest.date_of_birth}
                      </p>
                    </div>
                    {guest.id_photo_url && (
                      <div className="ml-4">
                        <img
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/id-photos/${guest.id_photo_url}`}
                          alt="ID Photo"
                          className="w-24 h-24 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">
              No guests have registered yet.
            </p>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-medium mb-4">
            Registration Link
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-600 mb-2">
              Share this link with your guests to allow them to register:
            </p>
            <code className="block bg-gray-100 p-2 rounded text-sm break-all">
              {`${process.env.NEXT_PUBLIC_SITE_URL}/register/${booking.booking_code}`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}