import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function PropertyPage({
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

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('owner_id', session.user.id)
    .single();

  if (!property) {
    return redirect('/properties');
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {property.name}
            </h1>
            <p className="text-gray-600">
              {property.address}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              property.subscription_status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {property.subscription_status}
          </span>
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-medium mb-4">
            Property Details
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Created</h3>
              <p className="text-gray-600">
                {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Last Updated</h3>
              <p className="text-gray-600">
                {new Date(property.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-medium mb-4">
            Actions
          </h2>
          <div className="space-x-4">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              onClick={() => {
                // TODO: Implement edit property
              }}
            >
              Edit Property
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              onClick={() => {
                // TODO: Implement delete property
              }}
            >
              Delete Property
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}