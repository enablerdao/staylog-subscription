import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function SignUpPage({
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

  if (session) {
    return redirect('/bookings');
  }

  return redirect('/signup');