// ─── Essential App Form ───────────────────────────────────────────────────────
// Reusable create / edit form for destination_essential_apps.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/FormSection';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { destinationsService } from '@/services/destinations.service';
import type { Destination, DestinationEssentialApp } from '@/types';

// ── Form value types ─────────────────────────────────────────────────────────

export interface EssentialAppFormValues {
  destination_id: string;
  name: string;
  subtitle: string;
  icon_url: string;
  external_url: string;
  sort_order: string;
  is_active: boolean;
}

export const APP_EMPTY_DEFAULTS: EssentialAppFormValues = {
  destination_id: '',
  name: '',
  subtitle: '',
  icon_url: '',
  external_url: '',
  sort_order: '0',
  is_active: true,
};

export function appToFormValues(a: DestinationEssentialApp): EssentialAppFormValues {
  return {
    destination_id: String(a.destination_id),
    name: a.name,
    subtitle: a.subtitle ?? '',
    icon_url: a.icon_url ?? '',
    external_url: a.external_url ?? '',
    sort_order: String(a.sort_order),
    is_active: a.is_active,
  };
}

// ── Form component ───────────────────────────────────────────────────────────

interface EssentialAppFormProps {
  defaultValues?: EssentialAppFormValues;
  onSubmit: (values: EssentialAppFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function EssentialAppForm({
  defaultValues = APP_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save',
  serverError,
}: EssentialAppFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EssentialAppFormValues>({ defaultValues });

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
        description="Select the destination this app belongs to."
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

      {/* Details */}
      <FormSection
        title="App Details"
        description="Name and subtitle displayed to users."
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            required
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
            placeholder="Kakao Maps"
          />
          <Input
            label="Subtitle"
            error={errors.subtitle?.message}
            {...register('subtitle')}
            placeholder="Navigation & maps (optional)"
          />
        </div>
      </FormSection>

      {/* URLs */}
      <FormSection
        title="URLs"
        description="Icon image and external link for the app."
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Icon URL"
            {...register('icon_url')}
            placeholder="https://example.com/icon.png"
          />
          <Input
            label="External URL"
            {...register('external_url')}
            placeholder="https://apps.apple.com/…"
          />
        </div>
      </FormSection>

      {/* Publishing */}
      <FormSection
        title="Publishing"
        description="Control display order and visibility."
      >
        <div className="flex items-start gap-8">
          <Input
            label="Sort order"
            type="number"
            min={0}
            className="w-28"
            {...register('sort_order')}
          />
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle
                label="Active"
                description="Show this app to users"
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
