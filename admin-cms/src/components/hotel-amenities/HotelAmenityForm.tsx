// ─── Hotel Amenity form ────────────────────────────────────────────────────
// Used by both HotelAmenityCreatePage and HotelAmenityEditPage.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { FormSection } from '@/components/ui/FormSection';
import { hotelsService } from '@/services/hotels.service';
import type { Hotel, HotelAmenity } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────

export interface HotelAmenityFormValues {
  hotel_id: string;
  amenity_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  icon_key: string;
  sort_order: string;
}

export function amenityToFormValues(a: HotelAmenity): HotelAmenityFormValues {
  return {
    hotel_id: String(a.hotel_id),
    amenity_key: a.amenity_key,
    label_ko: a.label_ko,
    label_en: a.label_en,
    label_vi: a.label_vi,
    icon_key: a.icon_key ?? '',
    sort_order: String(a.sort_order ?? 0),
  };
}

export const AMENITY_EMPTY_DEFAULTS: HotelAmenityFormValues = {
  hotel_id: '',
  amenity_key: '',
  label_ko: '', label_en: '', label_vi: '',
  icon_key: '',
  sort_order: '0',
};

// ─── Component ────────────────────────────────────────────────────────────

interface HotelAmenityFormProps {
  defaultValues?: HotelAmenityFormValues;
  onSubmit: (values: HotelAmenityFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function HotelAmenityForm({
  defaultValues = AMENITY_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save amenity',
  serverError,
}: HotelAmenityFormProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    hotelsService
      .list({ limit: 200 })
      .then((res) => setHotels(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HotelAmenityFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Hotel ── */}
      <FormSection title="Hotel" description="The hotel this amenity belongs to.">
        <Controller
          name="hotel_id"
          control={control}
          rules={{ required: 'Hotel is required.' }}
          render={({ field }) => (
            <Select
              label="Hotel"
              required
              error={errors.hotel_id?.message}
              className="max-w-xs"
              {...field}
            >
              <option value="">— select hotel —</option>
              {hotels.map((h) => (
                <option key={h.id} value={String(h.id)}>
                  {h.name} ({h.slug})
                </option>
              ))}
            </Select>
          )}
        />
      </FormSection>

      {/* ── Identity ── */}
      <FormSection title="Identity" description="Machine-readable key and optional icon identifier.">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <Input
            label="Amenity key"
            required
            placeholder="free_wifi"
            hint="Lowercase letters and underscores only."
            error={errors.amenity_key?.message}
            {...register('amenity_key', {
              required: 'Amenity key is required.',
              pattern: {
                value: /^[a-z0-9_]+$/,
                message: 'Use only lowercase letters, numbers and underscores.',
              },
            })}
          />
          <Input
            label="Icon key"
            placeholder="wifi"
            hint="Lucide icon name or custom key."
            {...register('icon_key')}
          />
        </div>
      </FormSection>

      {/* ── Labels ── */}
      <FormSection title="Labels" description="Displayed name in each language.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Label (KO)"
            required
            placeholder="무료 와이파이"
            error={errors.label_ko?.message}
            {...register('label_ko', { required: 'Korean label is required.' })}
          />
          <Input
            label="Label (EN)"
            required
            placeholder="Free WiFi"
            error={errors.label_en?.message}
            {...register('label_en', { required: 'English label is required.' })}
          />
          <Input
            label="Label (VI)"
            required
            placeholder="WiFi miễn phí"
            error={errors.label_vi?.message}
            {...register('label_vi', { required: 'Vietnamese label is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Ordering ── */}
      <FormSection title="Ordering" description="Controls the display order within the amenity list.">
        <Input
          label="Sort order"
          type="number"
          step="1"
          placeholder="0"
          className="w-32"
          hint="Lower number = higher priority."
          {...register('sort_order')}
        />
      </FormSection>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
