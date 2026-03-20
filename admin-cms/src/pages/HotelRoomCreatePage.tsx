import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelRoomForm,
  type HotelRoomFormValues,
} from '@/components/hotel-rooms/HotelRoomForm';
import { roomTypesService } from '@/services/hotel-rooms.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: HotelRoomFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    room_size_m2: values.room_size_m2 !== '' ? parseInt(values.room_size_m2) : null,
    max_guests: values.max_guests !== '' ? parseInt(values.max_guests) : null,
    nightly_price: parseInt(values.nightly_price),
    currency: values.currency || 'KRW',
    cover_image_url: values.cover_image_url || null,
    bed_label_ko: values.bed_label_ko || null,
    bed_label_en: values.bed_label_en || null,
    bed_label_vi: values.bed_label_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function HotelRoomCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: HotelRoomFormValues) {
    setServerError('');
    try {
      const created = await roomTypesService.create(coercePayload(values));
      navigate(`/hotel-rooms/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Room Type"
        subtitle="Add a room type to a hotel"
        actions={
          <Link to="/hotel-rooms">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <HotelRoomForm
          onSubmit={handleSubmit}
          submitLabel="Create room type"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
