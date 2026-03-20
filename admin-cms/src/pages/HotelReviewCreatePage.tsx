import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelReviewForm,
  type HotelReviewFormValues,
} from '@/components/hotel-reviews/HotelReviewForm';
import { hotelReviewsService } from '@/services/hotel-reviews.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: HotelReviewFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    reviewer_initial: values.reviewer_initial || null,
    content_ko: values.content_ko || null,
    content_en: values.content_en || null,
    content_vi: values.content_vi || null,
  };
}

export function HotelReviewCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: HotelReviewFormValues) {
    setServerError('');
    try {
      const created = await hotelReviewsService.create(coercePayload(values));
      navigate(`/hotel-reviews/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Hotel Review"
        subtitle="Add a guest review for a hotel"
        actions={
          <Link to="/hotel-reviews">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <HotelReviewForm
          onSubmit={handleSubmit}
          submitLabel="Create review"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
