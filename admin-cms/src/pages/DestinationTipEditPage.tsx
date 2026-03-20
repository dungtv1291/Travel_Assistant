import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  DestinationTipForm,
  tipToFormValues,
  type DestinationTipFormValues,
} from '@/components/destination-tips/DestinationTipForm';
import { destinationTipsService } from '@/services/destination-tips.service';
import { getErrorMessage } from '@/lib/api';
import type { DestinationTip } from '@/types';

function coercePayload(values: DestinationTipFormValues) {
  return {
    ...values,
    destination_id: parseInt(values.destination_id),
    order_no: parseInt(values.order_no) || 1,
  };
}

export function DestinationTipEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tip, setTip] = useState<DestinationTip | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tipId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!tipId) return;
    destinationTipsService
      .get(tipId)
      .then(setTip)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [tipId]);

  async function handleSubmit(values: DestinationTipFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await destinationTipsService.update(tipId, coercePayload(values));
      setTip(updated);
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
          title="Edit Tip"
          actions={<Link to="/destination-tips"><Button variant="secondary" size="sm">← Back</Button></Link>}
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (!tip) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching tip…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Tip #${tip.id}`}
        subtitle={`Order ${tip.order_no} · Destination #${tip.destination_id}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            <Link to="/destination-tips">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />
      <div className="mt-6 space-y-6">
        <DestinationTipForm
          defaultValues={tipToFormValues(tip)}
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
              <p className="text-sm font-medium text-slate-700">Delete this tip</p>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Delete this tip? This cannot be undone.`)) return;
                try {
                  await destinationTipsService.delete(tipId);
                  navigate('/destination-tips', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete tip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
