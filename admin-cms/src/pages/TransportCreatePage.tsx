import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { TransportForm, type TransportFormValues } from '@/components/transports/TransportForm';
import { transportsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: TransportFormValues) {
  return {
    ...values,
    destination_id: values.destination_id ? parseInt(values.destination_id) : null,
    capacity: values.capacity !== '' ? parseInt(values.capacity) : null,
    luggage_count: values.luggage_count !== '' ? parseInt(values.luggage_count) : null,
    vehicle_model: values.vehicle_model || null,
    transmission_label_ko: values.transmission_label_ko || null,
    transmission_label_en: values.transmission_label_en || null,
    transmission_label_vi: values.transmission_label_vi || null,
    driver_mode_label_ko: values.driver_mode_label_ko || null,
    driver_mode_label_en: values.driver_mode_label_en || null,
    driver_mode_label_vi: values.driver_mode_label_vi || null,
    cover_image_url: values.cover_image_url || null,
    rating: values.rating || null,
    review_count: parseInt(values.review_count) || 0,
    description_ko: values.description_ko || null,
    description_en: values.description_en || null,
    description_vi: values.description_vi || null,
    insurance_notice_ko: values.insurance_notice_ko || null,
    insurance_notice_en: values.insurance_notice_en || null,
    insurance_notice_vi: values.insurance_notice_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function TransportCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: TransportFormValues) {
    setServerError('');
    try {
      const created = await transportsService.create(coercePayload(values));
      navigate(`/transports/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Transport Service"
        subtitle="Add a new transport or vehicle rental service"
        actions={
          <Link to="/transports">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <TransportForm
          onSubmit={handleSubmit}
          submitLabel="Create service"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
