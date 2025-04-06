import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Navbar() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold">
            StayLog
          </Link>
          {session && (
            <>
              <Link
                href="/properties"
                className="hover:text-foreground/80 transition-colors"
              >
                Properties
              </Link>
              <Link
                href="/account"
                className="hover:text-foreground/80 transition-colors"
              >
                Account
              </Link>
            </>
          )}
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span>{session.user.email}</span>
              <form action="/auth/sign-out" method="post">
                <button
                  className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline"
                  type="submit"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/signin"
              className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}