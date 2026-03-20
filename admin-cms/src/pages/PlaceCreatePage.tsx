import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { PlaceForm, type PlaceFormValues } from '@/components/places/PlaceForm';
import { placesService } from '@/services/places.service';
import { getErrorMessage } from '@/lib/api';

export function PlaceCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: PlaceFormValues) {
    setServerError('');
    try {
      const created = await placesService.create({
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
      });
      // Navigate to edit page so tags can be added immediately
      navigate(`/places/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Place"
        subtitle="Add a new attraction or point of interest"
        actions={
          <Link to="/places">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <PlaceForm
          onSubmit={handleSubmit}
          submitLabel="Create place"
          serverError={serverError}
        />
      </div>
    </div>
  );
}

