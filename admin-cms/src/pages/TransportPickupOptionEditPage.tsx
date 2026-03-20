import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  TransportPickupOptionForm,
  pickupOptionToFormValues,
  type TransportPickupOptionFormValues,
} from '@/components/transports/TransportPickupOptionForm';
import { transportPickupOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportPickupOption } from '@/types';

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

export function TransportPickupOptionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opt, setOpt] = useState<TransportPickupOption | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const optId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!optId) return;
    transportPickupOptionsService
      .get(optId)
      .then(setOpt)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [optId]);

  async function handleSubmit(values: TransportPickupOptionFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await transportPickupOptionsService.update(optId, coercePayload(values));
      setOpt(updated);
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
          title="Edit Pickup Option"
          actions={<Link to="/transport-pickup-options"><Button variant="secondary" size="sm">← Back</Button></Link>}
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (!opt) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching pickup option…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${opt.label_en}`}
        subtitle={`ID ${opt.id} · ${opt.option_key}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            <Link to="/transport-pickup-options">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />
      <div className="mt-6 space-y-6">
        <TransportPickupOptionForm
          defaultValues={pickupOptionToFormValues(opt)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this pickup option</p>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Delete "${opt.label_en}"? This cannot be undone.`)) return;
                try {
                  await transportPickupOptionsService.delete(optId);
                  navigate('/transport-pickup-options', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete option
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
