'use client';

import Link from 'next/link';
import { Database } from '@/types_db';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  guests: Database['public']['Tables']['guests']['Row'][];
};

interface BookingsListProps {
  bookings: Booking[];
}

export default function BookingsList({ bookings }: BookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No bookings found.</p>
        <p className="text-sm text-gray-500">
          Create a new booking to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-lg shadow-sm border p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">
                Booking Code: {booking.booking_code}
              </h3>
              <p className="text-sm text-gray-500">
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Registered Guests ({booking.guests.length})
            </h4>
            {booking.guests.length > 0 ? (
              <ul className="space-y-2">
                {booking.guests.map((guest) => (
                  <li
                    key={guest.id}
                    className="text-sm text-gray-600 flex justify-between"
                  >
                    <span>{guest.name}</span>
                    <span>{guest.nationality}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No guests registered yet</p>
            )}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Link
              href={`/register/${booking.booking_code}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Registration Link
            </Link>
            <Link
              href={`/bookings/${booking.id}`}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              View Details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}