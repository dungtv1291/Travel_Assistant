// ─── Transport Duration Option Form ─────────────────────────────────────────
// Reusable create / edit form for transport_duration_options.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { transportsService } from '@/services/transports.service';
import type { TransportDurationOption, TransportService } from '@/types';

// ── Form value types ────────────────────────────────────────────────────────

export interface TransportDurationOptionFormValues {
  transport_service_id: string;
  value: string;         // integer days
  label_ko: string;
  label_en: string;
  label_vi: string;
  price_amount: string;  // integer
  currency: string;
  sort_order: string;
}

export const DURATION_OPTION_EMPTY_DEFAULTS: TransportDurationOptionFormValues = {
  transport_service_id: '',
  value: '',
  label_ko: '',
  label_en: '',
  label_vi: '',
  price_amount: '',
  currency: 'KRW',
  sort_order: '0',
};

export function durationOptionToFormValues(
  o: TransportDurationOption,
): TransportDurationOptionFormValues {
  return {
    transport_service_id: String(o.transport_service_id),
    value: String(o.value),
    label_ko: o.label_ko,
    label_en: o.label_en,
    label_vi: o.label_vi,
    price_amount: String(o.price_amount),
    currency: o.currency,
    sort_order: String(o.sort_order),
  };
}

// ── Form component ──────────────────────────────────────────────────────────

interface TransportDurationOptionFormProps {
  defaultValues?: TransportDurationOptionFormValues;
  onSubmit: (values: TransportDurationOptionFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
  /** When set, locks the transport selector to this service id */
  lockedTransportId?: number;
}

export function TransportDurationOptionForm({
  defaultValues = DURATION_OPTION_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save',
  serverError,
  lockedTransportId,
}: TransportDurationOptionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransportDurationOptionFormValues>({ defaultValues });

  const [transports, setTransports] = useState<TransportService[]>([]);

  useEffect(() => {
    transportsService
      .list({ limit: 200 })
      .then((res) => setTransports(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
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

      {/* Duration */}
      <FormSection
        title="Duration"
        description="Duration value (days) and label in each language."
      >
        <div className="grid grid-cols-4 gap-4">
          <Input
            label="Days"
            type="number"
            required
            min={1}
            error={errors.value?.message}
            {...register('value', { required: 'Number of days is required' })}
            placeholder="3"
          />
          <Input
            label="Label (KO)"
            required
            error={errors.label_ko?.message}
            {...register('label_ko', { required: 'Korean label is required' })}
            placeholder="3일"
          />
          <Input
            label="Label (EN)"
            required
            error={errors.label_en?.message}
            {...register('label_en', { required: 'English label is required' })}
            placeholder="3 days"
          />
          <Input
            label="Label (VI)"
            required
            error={errors.label_vi?.message}
            {...register('label_vi', { required: 'Vietnamese label is required' })}
            placeholder="3 ngày"
          />
        </div>
      </FormSection>

      {/* Pricing */}
      <FormSection
        title="Pricing"
        description="Price for this duration option."
      >
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price amount"
            type="number"
            required
            min={0}
            error={errors.price_amount?.message}
            {...register('price_amount', { required: 'Price is required' })}
            placeholder="150000"
          />
          <Input
            label="Currency"
            required
            error={errors.currency?.message}
            {...register('currency', { required: 'Currency is required' })}
            placeholder="KRW"
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
