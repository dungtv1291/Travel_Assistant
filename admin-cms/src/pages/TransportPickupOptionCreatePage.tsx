import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  TransportPickupOptionForm,
  type TransportPickupOptionFormValues,
} from '@/components/transports/TransportPickupOptionForm';
import { transportPickupOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: TransportPickupOptionFormValues) {
  return {
    ...values,
    transport_service_id: parseInt(values.transport_service_id),
    description_ko: values.description_ko || null,
    description_en: values.description_en || null,
    description_vi: values.description_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function TransportPickupOptionCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: TransportPickupOptionFormValues) {
    setServerError('');
    try {
      const created = await transportPickupOptionsService.create(coercePayload(values));
      navigate(`/transport-pickup-options/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Pickup Option"
        subtitle="Add a pickup point option for a transport service"
        actions={
          <Link to="/transport-pickup-options">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <TransportPickupOptionForm
          onSubmit={handleSubmit}
          submitLabel="Create option"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
