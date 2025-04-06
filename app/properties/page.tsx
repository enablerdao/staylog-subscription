import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Database } from '@/types_db';
import PropertiesList from '@/components/properties/properties-list';

export default async function Properties() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/signin');
  }

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Properties</h1>
      <PropertiesList properties={properties || []} />
    </div>
  );
}