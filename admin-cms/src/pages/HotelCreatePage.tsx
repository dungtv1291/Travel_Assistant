import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { HotelForm, type HotelFormValues } from '@/components/hotels/HotelForm';
import { hotelsService } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: HotelFormValues) {
  return {
    ...values,
    destination_id: parseInt(values.destination_id),
    star_rating: values.star_rating !== '' ? parseInt(values.star_rating) : null,
    rating: values.rating || null,
    review_count: values.review_count !== '' ? parseInt(values.review_count) : 0,
    nightly_from_price: values.nightly_from_price !== '' ? parseInt(values.nightly_from_price) : null,
    currency: values.currency || null,
    cover_image_url: values.cover_image_url || null,
    destination_label_ko: values.destination_label_ko || null,
    destination_label_en: values.destination_label_en || null,
    destination_label_vi: values.destination_label_vi || null,
    address_full_ko: values.address_full_ko || null,
    address_full_en: values.address_full_en || null,
    address_full_vi: values.address_full_vi || null,
    hotel_type_label_ko: values.hotel_type_label_ko || null,
    hotel_type_label_en: values.hotel_type_label_en || null,
    hotel_type_label_vi: values.hotel_type_label_vi || null,
    short_description_ko: values.short_description_ko || null,
    short_description_en: values.short_description_en || null,
    short_description_vi: values.short_description_vi || null,
    check_in_time: values.check_in_time || null,
    check_out_time: values.check_out_time || null,
    cancellation_policy_label_ko: values.cancellation_policy_label_ko || null,
    cancellation_policy_label_en: values.cancellation_policy_label_en || null,
    cancellation_policy_label_vi: values.cancellation_policy_label_vi || null,
    pets_policy_label_ko: values.pets_policy_label_ko || null,
    pets_policy_label_en: values.pets_policy_label_en || null,
    pets_policy_label_vi: values.pets_policy_label_vi || null,
    smoking_policy_label_ko: values.smoking_policy_label_ko || null,
    smoking_policy_label_en: values.smoking_policy_label_en || null,
    smoking_policy_label_vi: values.smoking_policy_label_vi || null,
    policy_notice_ko: values.policy_notice_ko || null,
    policy_notice_en: values.policy_notice_en || null,
    policy_notice_vi: values.policy_notice_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function HotelCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: HotelFormValues) {
    setServerError('');
    try {
      const created = await hotelsService.create(coercePayload(values));
      // Navigate to edit page so badges/images can be added immediately
      navigate(`/hotels/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Hotel"
        subtitle="Add a new hotel listing"
        actions={
          <Link to="/hotels">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <HotelForm
          onSubmit={handleSubmit}
          submitLabel="Create hotel"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
