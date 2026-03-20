import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { DestinationForm, type DestinationFormValues } from '@/components/destinations/DestinationForm';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';

export function DestinationCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: DestinationFormValues) {
    setServerError('');
    try {
      const created = await destinationsService.create({
        ...values,
        rating: values.rating !== '' ? values.rating : null,
        review_count: values.review_count !== '' ? parseInt(values.review_count) : 0,
        match_percent: values.match_percent !== '' ? parseInt(values.match_percent) : null,
        average_temperature_c: values.average_temperature_c !== '' ? parseInt(values.average_temperature_c) : null,
        sort_order: parseInt(values.sort_order) || 0,
        code: values.code || null,
        hero_image_url: values.hero_image_url || null,
        // Nullable text fields
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
      });
      // Navigate to edit page so badges/tags can be added immediately
      navigate(`/destinations/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Destination"
        subtitle="Add a new travel destination"
        actions={
          <Link to="/destinations">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <DestinationForm
          onSubmit={handleSubmit}
          submitLabel="Create destination"
          serverError={serverError}
        />
      </div>
    </div>
  );
}

