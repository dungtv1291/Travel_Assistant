import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelAmenityForm,
  amenityToFormValues,
  type HotelAmenityFormValues,
} from '@/components/hotel-amenities/HotelAmenityForm';
import { hotelAmenitiesService } from '@/services/hotel-amenities.service';
import { getErrorMessage } from '@/lib/api';
import type { HotelAmenity } from '@/types';

function coercePayload(values: HotelAmenityFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    icon_key: values.icon_key || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function HotelAmenityEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [amenity, setAmenity] = useState<HotelAmenity | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const amenityId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!amenityId) return;
    hotelAmenitiesService
      .get(amenityId)
      .then(setAmenity)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [amenityId]);

  async function handleSubmit(values: HotelAmenityFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await hotelAmenitiesService.update(amenityId, coercePayload(values));
      setAmenity(updated);
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
          title="Edit Amenity"
          actions={
            <Link to="/hotel-amenities">
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

  if (!amenity) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching amenity…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${amenity.amenity_key}`}
        subtitle={`Amenity ID ${amenity.id} · Hotel #${amenity.hotel_id}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/hotel-amenities">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        <HotelAmenityForm
          defaultValues={amenityToFormValues(amenity)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this amenity</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently removes this amenity from the hotel.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete amenity "${amenity.amenity_key}"? This cannot be undone.`)) return;
                try {
                  await hotelAmenitiesService.delete(amenityId);
                  navigate('/hotel-amenities', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete amenity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
