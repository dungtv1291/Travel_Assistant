import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  EssentialAppForm,
  type EssentialAppFormValues,
} from '@/components/essential-apps/EssentialAppForm';
import { essentialAppsService } from '@/services/essential-apps.service';
import { getErrorMessage } from '@/lib/api';

function coercePayload(values: EssentialAppFormValues) {
  return {
    ...values,
    destination_id: parseInt(values.destination_id),
    sort_order: parseInt(values.sort_order) || 0,
    subtitle: values.subtitle || null,
    icon_url: values.icon_url || null,
    external_url: values.external_url || null,
  };
}

export function EssentialAppCreatePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  async function handleSubmit(values: EssentialAppFormValues) {
    setServerError('');
    try {
      const created = await essentialAppsService.create(coercePayload(values));
      navigate(`/essential-apps/${created.id}/edit`, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  return (
    <div>
      <PageHeader
        title="New Essential App"
        subtitle="Add a useful app recommendation for a destination"
        actions={
          <Link to="/essential-apps">
            <Button variant="secondary" size="sm">← Back to list</Button>
          </Link>
        }
      />
      <div className="mt-6">
        <EssentialAppForm
          onSubmit={handleSubmit}
          submitLabel="Create app"
          serverError={serverError}
        />
      </div>
    </div>
  );
}
