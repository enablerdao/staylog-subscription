import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Database } from '@/types_db';
import PropertyForm from '@/components/properties/property-form';

export default async function NewProperty() {
  const supabase = createServerClient<Database>({ cookies });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/signin');
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Property</h1>
      <PropertyForm
        onSubmit={async (data) => {
          'use server';
          const { name, address } = data;
          await supabase.from('properties').insert({
            name,
            address,
            owner_id: session.user.id,
            subscription_status: 'active'
          });
        }}
      />
    </div>
  );
}