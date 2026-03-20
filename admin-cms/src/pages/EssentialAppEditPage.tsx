import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  EssentialAppForm,
  appToFormValues,
  type EssentialAppFormValues,
} from '@/components/essential-apps/EssentialAppForm';
import { essentialAppsService } from '@/services/essential-apps.service';
import { getErrorMessage } from '@/lib/api';
import type { DestinationEssentialApp } from '@/types';

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

export function EssentialAppEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<DestinationEssentialApp | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const appId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!appId) return;
    essentialAppsService
      .get(appId)
      .then(setApp)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [appId]);

  async function handleSubmit(values: EssentialAppFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await essentialAppsService.update(appId, coercePayload(values));
      setApp(updated);
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
          title="Edit Essential App"
          actions={<Link to="/essential-apps"><Button variant="secondary" size="sm">← Back</Button></Link>}
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{loadError}</div>
      </div>
    );
  }

  if (!app) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching app…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${app.name}`}
        subtitle={`ID ${app.id} · Destination #${app.destination_id}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && <span className="text-xs text-green-600 font-medium">Saved ✓</span>}
            <Link to="/essential-apps">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />
      <div className="mt-6 space-y-6">
        <EssentialAppForm
          defaultValues={appToFormValues(app)}
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
              <p className="text-sm font-medium text-slate-700">Delete this app</p>
              <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
                try {
                  await essentialAppsService.delete(appId);
                  navigate('/essential-apps', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete app
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
