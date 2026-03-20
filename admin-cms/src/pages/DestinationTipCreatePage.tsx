import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  DestinationTipForm,
  type DestinationTipFormValues,
} from '@/components/destination-tips/DestinationTipForm';
import { destinationTipsService } from '@/services/destination-tips.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: DestinationTipFormValues) {
  return {
    ...values,
    destination_id: parseInt(values.destination_id),
    order_no: parseInt(values.order_no) || 1,
  };
}

export function DestinationTipCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: DestinationTipFormValues) {
    setServerError('');
    try {
      const created = await destinationTipsService.create(coercePayload(values));
      navigate(`/destination-tips/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Destination Tip"
        subtitle="Add a travel tip for a destination"
        actions={
          <Link to="/destination-tips">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <DestinationTipForm
          onSubmit={handleSubmit}
          submitLabel="Create tip"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
