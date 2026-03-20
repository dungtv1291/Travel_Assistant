import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  PlaceForm,
  placeToFormValues,
  type PlaceFormValues,
} from '@/components/places/PlaceForm';
import { PlaceTagsEditor } from '@/components/places/PlaceTagsEditor';
import { placesService } from '@/services/places.service';
import { getErrorMessage } from '@/lib/api';
import type { Place } from '@/types';

function coercePayload(values: PlaceFormValues) {
  return {
    ...values,
    destination_id: parseInt(values.destination_id),
    rating: values.rating || null,
    review_count: values.review_count !== '' ? parseInt(values.review_count) : 0,
    ticket_price_amount: values.ticket_price_amount || null,
    ticket_price_currency: values.ticket_price_currency || null,
    lat: values.lat || null,
    lng: values.lng || null,
    cover_image_url: values.cover_image_url || null,
    category_label_ko: values.category_label_ko || null,
    category_label_en: values.category_label_en || null,
    category_label_vi: values.category_label_vi || null,
    short_description_ko: values.short_description_ko || null,
    short_description_en: values.short_description_en || null,
    short_description_vi: values.short_description_vi || null,
    visit_duration_label_ko: values.visit_duration_label_ko || null,
    visit_duration_label_en: values.visit_duration_label_en || null,
    visit_duration_label_vi: values.visit_duration_label_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function PlaceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [place, setPlace] = useState<Place | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const placeId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!placeId) return;
    placesService
      .get(placeId)
      .then(setPlace)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [placeId]);

  async function handleSubmit(values: PlaceFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await placesService.update(placeId, coercePayload(values));
      setPlace(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Edit Place" actions={
          <Link to="/places"><Button variant="secondary" size="sm">← Back</Button></Link>
        } />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching place…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${place.name_en}`}
        subtitle={`ID ${place.id} · ${place.slug}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/places">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Main form */}
        <PlaceForm
          defaultValues={placeToFormValues(place)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        {/* Tag management */}
        <PlaceTagsEditor placeId={placeId} />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this place</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently deletes the place and all its tags.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete "${place.name_en}"? This cannot be undone.`)) return;
                try {
                  await placesService.delete(placeId);
                  navigate('/places', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete place
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

