import Link from 'next/link';
import { Property } from '@/types_db';

interface PropertiesListProps {
  properties: Property[];
}

export default function PropertiesList({ properties }: PropertiesListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-600 mb-4">No properties found.</p>
        <Link
          href="/properties/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Add New Property
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link
          href="/properties/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Add New Property
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{property.name}</h2>
            <p className="text-gray-600 mb-4">{property.address}</p>
            <div className="flex justify-between items-center">
              <Link
                href={`/properties/${property.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
              </Link>
              <span className="text-sm text-gray-500">
                {property.subscription_status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}