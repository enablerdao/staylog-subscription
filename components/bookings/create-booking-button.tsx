'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types_db';

function generateBookingCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateBookingButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleCreateBooking = async () => {
    setLoading(true);
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const booking_code = generateBookingCode();
      const { error, data } = await supabase
        .from('bookings')
        .insert({
          booking_code,
          host_id: session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      router.push(`/bookings/${data.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreateBooking}
      disabled={loading}
      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Creating...' : 'Create New Booking'}
    </button>
  );
}