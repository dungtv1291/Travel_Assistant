import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  TransportForm,
  transportToFormValues,
  type TransportFormValues,
} from '@/components/transports/TransportForm';
import { TransportBadgesEditor } from '@/components/transports/TransportBadgesEditor';
import { DurationOptionsEditor } from '@/components/transports/DurationOptionsEditor';
import { PickupOptionsEditor } from '@/components/transports/PickupOptionsEditor';
import { transportsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportService } from '@/types';

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

export function TransportEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [transport, setTransport] = useState<TransportService | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const transportId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!transportId) return;
    transportsService
      .get(transportId)
      .then(setTransport)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [transportId]);

  async function handleSubmit(values: TransportFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await transportsService.update(transportId, coercePayload(values));
      setTransport(updated);
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
          title="Edit Transport Service"
          actions={
            <Link to="/transports">
              <Button variant="secondary" size="sm">← Back</Button>
            </Link>
          }
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!transport) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching transport service…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${transport.name_en}`}
        subtitle={`ID ${transport.id} · ${transport.slug}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/transports">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        {/* Main form */}
        <TransportForm
          defaultValues={transportToFormValues(transport)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        {/* Badges */}
        <TransportBadgesEditor transportId={transportId} />

        {/* Duration options */}
        <DurationOptionsEditor transportId={transportId} />

        {/* Pickup options */}
        <PickupOptionsEditor transportId={transportId} />

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this transport service</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently deletes the service and all associated badges, duration options, and pickup options.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete "${transport.name_en}"? This cannot be undone.`)) return;
                try {
                  await transportsService.delete(transportId);
                  navigate('/transports', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
