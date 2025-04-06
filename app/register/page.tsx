import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function RegisterPage({
  searchParams
}: {
  searchParams: { booking_code?: string };
}) {
  const { booking_code } = searchParams;

  if (booking_code) {
    return redirect(`/register/${booking_code}`);
  }

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

  if (session) {
    return redirect('/bookings');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter Your Booking Code
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter the booking code provided by your host
          </p>
        </div>
        <form
          className="mt-8 space-y-6"
          action={(formData: FormData) => {
            const code = formData.get('booking_code') as string;
            if (code) {
              redirect(`/register/${code}`);
            }
          }}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="booking_code" className="sr-only">
                Booking Code
              </label>
              <input
                id="booking_code"
                name="booking_code"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                placeholder="Enter your booking code"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}