import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  TransportDurationOptionForm,
  type TransportDurationOptionFormValues,
} from '@/components/transports/TransportDurationOptionForm';
import { transportDurationOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: TransportDurationOptionFormValues) {
  return {
    ...values,
    transport_service_id: parseInt(values.transport_service_id),
    value: parseInt(values.value),
    price_amount: parseInt(values.price_amount),
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function TransportDurationOptionCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: TransportDurationOptionFormValues) {
    setServerError('');
    try {
      const created = await transportDurationOptionsService.create(coercePayload(values));
      navigate(`/transport-duration-options/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Duration Option"
        subtitle="Add a duration and pricing option for a transport service"
        actions={
          <Link to="/transport-duration-options">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <TransportDurationOptionForm
          onSubmit={handleSubmit}
          submitLabel="Create option"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
