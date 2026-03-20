import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  DestinationForm,
  destinationToFormValues,
  type DestinationFormValues,
} from '@/components/destinations/DestinationForm';
import { BadgesEditor } from '@/components/destinations/BadgesEditor';
import { FeatureTagsEditor } from '@/components/destinations/FeatureTagsEditor';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination } from '@/types';

function coercePayload(values: DestinationFormValues) {
  return {
    ...values,
    rating: values.rating !== '' ? values.rating : null,
    review_count: values.review_count !== '' ? parseInt(values.review_count) : 0,
    match_percent: values.match_percent !== '' ? parseInt(values.match_percent) : null,
    average_temperature_c: values.average_temperature_c !== '' ? parseInt(values.average_temperature_c) : null,
    sort_order: parseInt(values.sort_order) || 0,
    code: values.code || null,
    hero_image_url: values.hero_image_url || null,
    region_label_ko: values.region_label_ko || null,
    region_label_en: values.region_label_en || null,
    region_label_vi: values.region_label_vi || null,
    country_label_ko: values.country_label_ko || null,
    country_label_en: values.country_label_en || null,
    country_label_vi: values.country_label_vi || null,
    short_description_ko: values.short_description_ko || null,
    short_description_en: values.short_description_en || null,
    short_description_vi: values.short_description_vi || null,
    overview_description_ko: values.overview_description_ko || null,
    overview_description_en: values.overview_description_en || null,
    overview_description_vi: values.overview_description_vi || null,
    best_season_label_ko: values.best_season_label_ko || null,
    best_season_label_en: values.best_season_label_en || null,
    best_season_label_vi: values.best_season_label_vi || null,
    language_label_ko: values.language_label_ko || null,
    language_label_en: values.language_label_en || null,
    language_label_vi: values.language_label_vi || null,
    currency_label_ko: values.currency_label_ko || null,
    currency_label_en: values.currency_label_en || null,
    currency_label_vi: values.currency_label_vi || null,
  };
}

export function DestinationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const destId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!destId) return;
    destinationsService
      .get(destId)
      .then(setDestination)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [destId]);

  async function handleSubmit(values: DestinationFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await destinationsService.update(destId, coercePayload(values));
      setDestination(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Edit Destination" actions={
          <Link to="/destinations"><Button variant="secondary" size="sm">← Back</Button></Link>
        } />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching destination…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${destination.name_en}`}
        subtitle={`ID ${destination.id} · ${destination.slug}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/destinations">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Main form */}
        <DestinationForm
          defaultValues={destinationToFormValues(destination)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        {/* Badge management */}
        <BadgesEditor destinationId={destId} />

        {/* Feature tag management */}
        <FeatureTagsEditor destinationId={destId} />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this destination</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently deletes the destination and all its sub-resources.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete "${destination.name_en}"? This cannot be undone.`)) return;
                try {
                  await destinationsService.delete(destId);
                  navigate('/destinations', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete destination
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

