// ─── Destination Tip Form ────────────────────────────────────────────────────
// Reusable create / edit form for destination_tips.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { destinationsService } from '@/services/destinations.service';
import type { Destination, DestinationTip } from '@/types';

// ── Form value types ─────────────────────────────────────────────────────────

export interface DestinationTipFormValues {
  destination_id: string;
  order_no: string;
  text_ko: string;
  text_en: string;
  text_vi: string;
  is_active: boolean;
}

export const TIP_EMPTY_DEFAULTS: DestinationTipFormValues = {
  destination_id: '',
  order_no: '1',
  text_ko: '',
  text_en: '',
  text_vi: '',
  is_active: true,
};

export function tipToFormValues(t: DestinationTip): DestinationTipFormValues {
  return {
    destination_id: String(t.destination_id),
    order_no: String(t.order_no),
    text_ko: t.text_ko,
    text_en: t.text_en,
    text_vi: t.text_vi,
    is_active: t.is_active,
  };
}

// ── Form component ───────────────────────────────────────────────────────────

interface DestinationTipFormProps {
  defaultValues?: DestinationTipFormValues;
  onSubmit: (values: DestinationTipFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function DestinationTipForm({
  defaultValues = TIP_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save',
  serverError,
}: DestinationTipFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DestinationTipFormValues>({ defaultValues });

  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => setDestinations(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Destination */}
      <FormSection
        title="Destination"
        description="Select the destination this tip belongs to."
      >
        <Controller
          control={control}
          name="destination_id"
          rules={{ required: 'Destination is required' }}
          render={({ field }) => (
            <Select
              label="Destination"
              required
              error={errors.destination_id?.message}
              value={field.value}
              onChange={field.onChange}
              className="w-full max-w-xs"
            >
              <option value="">— Select a destination —</option>
              {destinations.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name_en}
                </option>
              ))}
            </Select>
          )}
        />
      </FormSection>

      {/* Tip Text */}
      <FormSection
        title="Tip Text"
        description="Enter the tip text in all three languages."
      >
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Text (KO)"
            required
            rows={4}
            error={errors.text_ko?.message}
            {...register('text_ko', { required: 'Korean text is required' })}
            placeholder="한국어 팁 내용"
          />
          <Textarea
            label="Text (EN)"
            required
            rows={4}
            error={errors.text_en?.message}
            {...register('text_en', { required: 'English text is required' })}
            placeholder="English tip content"
          />
          <Textarea
            label="Text (VI)"
            required
            rows={4}
            error={errors.text_vi?.message}
            {...register('text_vi', { required: 'Vietnamese text is required' })}
            placeholder="Nội dung mẹo tiếng Việt"
          />
        </div>
      </FormSection>

      {/* Ordering & Publishing */}
      <FormSection
        title="Ordering & Publishing"
        description="Control the display order and visibility of this tip."
      >
        <div className="flex items-start gap-8">
          <Input
            label="Order no."
            type="number"
            min={1}
            className="w-28"
            {...register('order_no')}
          />
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle
                label="Active"
                description="Show this tip to users"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
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
