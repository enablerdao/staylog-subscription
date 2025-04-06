import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Database } from '@/types_db';

export default async function RegistrationConfirmation({
  params: { booking_id }
}: {
  params: { booking_id: string };
}) {
  const supabase = createServerClient<Database>({ cookies });

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('booking_id', booking_id);

  if (!guests || guests.length === 0) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Registration Complete
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Thank you for registering. Your information has been saved.</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Registered Guests</h2>
      <div className="space-y-4">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h3 className="font-medium">{guest.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{guest.nationality}</p>
            <p className="text-gray-600 text-sm">Passport: {guest.passport_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
}