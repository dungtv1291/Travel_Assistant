// ─── Transport Pickup Option Form ───────────────────────────────────────────
// Reusable create / edit form for transport_pickup_options.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { transportsService } from '@/services/transports.service';
import type { TransportPickupOption, TransportService } from '@/types';

// ── Form value types ────────────────────────────────────────────────────────

export interface TransportPickupOptionFormValues {
  transport_service_id: string;
  option_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  description_ko: string;
  description_en: string;
  description_vi: string;
  sort_order: string;
  is_active: boolean;
}

export const PICKUP_OPTION_EMPTY_DEFAULTS: TransportPickupOptionFormValues = {
  transport_service_id: '',
  option_key: '',
  label_ko: '',
  label_en: '',
  label_vi: '',
  description_ko: '',
  description_en: '',
  description_vi: '',
  sort_order: '0',
  is_active: true,
};

export function pickupOptionToFormValues(
  o: TransportPickupOption,
): TransportPickupOptionFormValues {
  return {
    transport_service_id: String(o.transport_service_id),
    option_key: o.option_key,
    label_ko: o.label_ko,
    label_en: o.label_en,
    label_vi: o.label_vi,
    description_ko: o.description_ko ?? '',
    description_en: o.description_en ?? '',
    description_vi: o.description_vi ?? '',
    sort_order: String(o.sort_order),
    is_active: o.is_active,
  };
}

// ── Form component ──────────────────────────────────────────────────────────

interface TransportPickupOptionFormProps {
  defaultValues?: TransportPickupOptionFormValues;
  onSubmit: (values: TransportPickupOptionFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
  /** When set, locks the transport selector to this service id */
  lockedTransportId?: number;
}

export function TransportPickupOptionForm({
  defaultValues = PICKUP_OPTION_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save',
  serverError,
  lockedTransportId,
}: TransportPickupOptionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransportPickupOptionFormValues>({ defaultValues });

  const [transports, setTransports] = useState<TransportService[]>([]);

  useEffect(() => {
    transportsService
      .list({ limit: 200 })
      .then((res) => setTransports(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Transport Service */}
      <FormSection title="Transport Service" description="Select the service this option belongs to.">
        <Controller
          control={control}
          name="transport_service_id"
          rules={{ required: 'Transport service is required' }}
          render={({ field }) => (
            <Select
              label="Transport service"
              required
              error={errors.transport_service_id?.message}
              value={field.value}
              onChange={field.onChange}
              disabled={lockedTransportId !== undefined}
              className="w-full max-w-xs"
            >
              <option value="">— Select a transport service —</option>
              {transports.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name_en} ({t.service_type})
                </option>
              ))}
            </Select>
          )}
        />
      </FormSection>

      {/* Identity */}
      <FormSection
        title="Identity"
        description="Machine-readable key (e.g. airport_direct) and active status."
      >
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <Input
              label="Option key"
              required
              hint="Lowercase, underscores — e.g. airport_direct"
              error={errors.option_key?.message}
              {...register('option_key', { required: 'Option key is required' })}
              placeholder="airport_direct"
            />
          </div>
          <div className="mb-0.5">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <Toggle
                  label="Active"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </FormSection>

      {/* Labels */}
      <FormSection
        title="Labels"
        description="Display name in each language."
      >
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Label (KO)"
            required
            error={errors.label_ko?.message}
            {...register('label_ko', { required: 'Korean label is required' })}
            placeholder="공항 직접 픽업"
          />
          <Input
            label="Label (EN)"
            required
            error={errors.label_en?.message}
            {...register('label_en', { required: 'English label is required' })}
            placeholder="Direct airport pickup"
          />
          <Input
            label="Label (VI)"
            required
            error={errors.label_vi?.message}
            {...register('label_vi', { required: 'Vietnamese label is required' })}
            placeholder="Đón trực tiếp tại sân bay"
          />
        </div>
      </FormSection>

      {/* Description */}
      <FormSection
        title="Description"
        description="Optional extended description in each language."
      >
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Description (KO)"
            rows={3}
            {...register('description_ko')}
            placeholder="공항 도착 게이트에서 기사가 직접 픽업합니다"
          />
          <Textarea
            label="Description (EN)"
            rows={3}
            {...register('description_en')}
            placeholder="Driver picks you up directly from the arrival gate"
          />
          <Textarea
            label="Description (VI)"
            rows={3}
            {...register('description_vi')}
            placeholder="Tài xế đón bạn trực tiếp tại cổng đến"
          />
        </div>
      </FormSection>

      {/* Ordering */}
      <FormSection title="Ordering">
        <Input
          label="Sort order"
          type="number"
          className="w-28"
          {...register('sort_order')}
        />
      </FormSection>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
