import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  TransportDurationOptionForm,
  durationOptionToFormValues,
  type TransportDurationOptionFormValues,
} from '@/components/transports/TransportDurationOptionForm';
import { transportDurationOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportDurationOption } from '@/types';

function coercePayload(values: TransportDurationOptionFormValues) {
  return {
    ...values,
    transport_service_id: parseInt(values.transport_service_id),
    value: parseInt(values.value),
    price_amount: parseInt(values.price_amount),
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function TransportDurationOptionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [opt, setOpt] = useState<TransportDurationOption | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const optId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!optId) return;
    transportDurationOptionsService
      .get(optId)
      .then(setOpt)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [optId]);

  async function handleSubmit(values: TransportDurationOptionFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await transportDurationOptionsService.update(optId, coercePayload(values));
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
          title="Edit Duration Option"
          actions={<Link to="/transport-duration-options"><Button variant="secondary" size="sm">← Back</Button></Link>}
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (!opt) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching duration option…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${opt.label_en}`}
        subtitle={`ID ${opt.id} · ${opt.value} days`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            <Link to="/transport-duration-options">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />
      <div className="mt-6 space-y-6">
        <TransportDurationOptionForm
          defaultValues={durationOptionToFormValues(opt)}
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
              <p className="text-sm font-medium text-slate-700">Delete this duration option</p>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Delete "${opt.label_en}"? This cannot be undone.`)) return;
                try {
                  await transportDurationOptionsService.delete(optId);
                  navigate('/transport-duration-options', { replace: true });
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
