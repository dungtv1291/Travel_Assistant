import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelAmenityForm,
  type HotelAmenityFormValues,
} from '@/components/hotel-amenities/HotelAmenityForm';
import { hotelAmenitiesService } from '@/services/hotel-amenities.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: HotelAmenityFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    icon_key: values.icon_key || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function HotelAmenityCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: HotelAmenityFormValues) {
    setServerError('');
    try {
      const created = await hotelAmenitiesService.create(coercePayload(values));
      navigate(`/hotel-amenities/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Hotel Amenity"
        subtitle="Add an amenity to a hotel"
        actions={
          <Link to="/hotel-amenities">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <HotelAmenityForm
          onSubmit={handleSubmit}
          submitLabel="Create amenity"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
