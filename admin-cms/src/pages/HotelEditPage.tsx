import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelForm,
  hotelToFormValues,
  type HotelFormValues,
} from '@/components/hotels/HotelForm';
import { HotelBadgesEditor } from '@/components/hotels/HotelBadgesEditor';
import { HotelImagesEditor } from '@/components/hotels/HotelImagesEditor';
import { hotelsService } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';
import type { Hotel } from '@/types';

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

export function HotelEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const hotelId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!hotelId) return;
    hotelsService
      .get(hotelId)
      .then(setHotel)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [hotelId]);

  async function handleSubmit(values: HotelFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await hotelsService.update(hotelId, coercePayload(values));
      setHotel(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader
          title="Edit Hotel"
          actions={
            <Link to="/hotels">
              <Button variant="secondary" size="sm">← Back</Button>
            </Link>
          }
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching hotel…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${hotel.name}`}
        subtitle={`ID ${hotel.id} · ${hotel.slug}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/hotels">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Main form */}
        <HotelForm
          defaultValues={hotelToFormValues(hotel)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        {/* Badges management */}
        <HotelBadgesEditor hotelId={hotelId} />

        {/* Images management */}
        <HotelImagesEditor hotelId={hotelId} />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this hotel</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently deletes the hotel and all its sub-resources (badges, images, rooms).
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete "${hotel.name}"? This cannot be undone.`)) return;
                try {
                  await hotelsService.delete(hotelId);
                  navigate('/hotels', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete hotel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
