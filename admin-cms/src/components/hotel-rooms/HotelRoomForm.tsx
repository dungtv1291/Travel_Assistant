// ─── Hotel Room Type form ──────────────────────────────────────────────────
// Used by both HotelRoomCreatePage and HotelRoomEditPage.
// All fields map 1-to-1 to the `hotel_room_types` table columns.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { FormSection } from '@/components/ui/FormSection';
import { hotelsService } from '@/services/hotels.service';
import type { Hotel, HotelRoomType } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────

export interface HotelRoomFormValues {
  hotel_id: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  bed_label_ko: string;
  bed_label_en: string;
  bed_label_vi: string;
  room_size_m2: string;
  max_guests: string;
  cover_image_url: string;
  nightly_price: string;
  currency: string;
  is_default_selected: boolean;
  is_active: boolean;
  sort_order: string;
}

export function roomToFormValues(r: HotelRoomType): HotelRoomFormValues {
  return {
    hotel_id: String(r.hotel_id),
    name_ko: r.name_ko ?? '',
    name_en: r.name_en ?? '',
    name_vi: r.name_vi ?? '',
    bed_label_ko: r.bed_label_ko ?? '',
    bed_label_en: r.bed_label_en ?? '',
    bed_label_vi: r.bed_label_vi ?? '',
    room_size_m2: r.room_size_m2 != null ? String(r.room_size_m2) : '',
    max_guests: r.max_guests != null ? String(r.max_guests) : '',
    cover_image_url: r.cover_image_url ?? '',
    nightly_price: r.nightly_price != null ? String(r.nightly_price) : '',
    currency: r.currency ?? 'KRW',
    is_default_selected: r.is_default_selected,
    is_active: r.is_active,
    sort_order: String(r.sort_order ?? 0),
  };
}

export const ROOM_EMPTY_DEFAULTS: HotelRoomFormValues = {
  hotel_id: '',
  name_ko: '', name_en: '', name_vi: '',
  bed_label_ko: '', bed_label_en: '', bed_label_vi: '',
  room_size_m2: '', max_guests: '',
  cover_image_url: '',
  nightly_price: '', currency: 'KRW',
  is_default_selected: false,
  is_active: true,
  sort_order: '0',
};

// ─── Component ────────────────────────────────────────────────────────────

interface HotelRoomFormProps {
  defaultValues?: HotelRoomFormValues;
  onSubmit: (values: HotelRoomFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function HotelRoomForm({
  defaultValues = ROOM_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save room type',
  serverError,
}: HotelRoomFormProps) {
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
  } = useForm<HotelRoomFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Hotel ── */}
      <FormSection title="Hotel" description="The hotel this room type belongs to.">
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

      {/* ── Room Name ── */}
      <FormSection title="Room Name" description="Multilingual name shown on listing cards and booking flow.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Name (KO)"
            required
            placeholder="디럭스 더블룸"
            error={errors.name_ko?.message}
            {...register('name_ko', { required: 'Korean name is required.' })}
          />
          <Input
            label="Name (EN)"
            required
            placeholder="Deluxe Double Room"
            error={errors.name_en?.message}
            {...register('name_en', { required: 'English name is required.' })}
          />
          <Input
            label="Name (VI)"
            required
            placeholder="Phòng Deluxe Double"
            error={errors.name_vi?.message}
            {...register('name_vi', { required: 'Vietnamese name is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Bed Type ── */}
      <FormSection title="Bed Type" description="Bed configuration shown as a label on the room card.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Bed label (KO)" placeholder="킹 1개" {...register('bed_label_ko')} />
          <Input label="Bed label (EN)" placeholder="1 King Bed" {...register('bed_label_en')} />
          <Input label="Bed label (VI)" placeholder="1 Giường King" {...register('bed_label_vi')} />
        </div>
      </FormSection>

      {/* ── Room Details ── */}
      <FormSection title="Room Details" description="Physical dimensions and guest capacity.">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Input
            label="Room size (m²)"
            type="number"
            min="0"
            step="1"
            placeholder="35"
            {...register('room_size_m2')}
          />
          <Input
            label="Max guests"
            type="number"
            min="1"
            step="1"
            placeholder="2"
            {...register('max_guests')}
          />
        </div>
      </FormSection>

      {/* ── Cover Image ── */}
      <FormSection title="Cover Image" description="Primary image shown on room cards.">
        <Input
          label="Cover image URL"
          placeholder="/uploads/rooms/deluxe-double.jpg"
          hint="Enter a path or full URL."
          {...register('cover_image_url')}
        />
      </FormSection>

      {/* ── Pricing ── */}
      <FormSection title="Pricing" description="Nightly rate displayed on booking cards.">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Input
            label="Nightly price"
            required
            placeholder="150000"
            hint="Numeric amount (no currency symbol)."
            error={errors.nightly_price?.message}
            {...register('nightly_price', { required: 'Nightly price is required.' })}
          />
          <Input
            label="Currency"
            placeholder="KRW"
            hint="ISO code e.g. KRW, USD, VND."
            {...register('currency')}
          />
        </div>
      </FormSection>

      {/* ── Publishing ── */}
      <FormSection title="Publishing" description="Visibility, default selection and display ordering.">
        <div className="flex flex-wrap items-start gap-6">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Active"
                checked={field.value}
                onChange={field.onChange}
                description="Inactive rooms are hidden from users."
              />
            )}
          />
          <Controller
            name="is_default_selected"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Default selected"
                checked={field.value}
                onChange={field.onChange}
                description="Pre-selected in the room picker on the hotel page."
              />
            )}
          />
          <Input
            label="Sort order"
            type="number"
            step="1"
            placeholder="0"
            className="w-32"
            hint="Lower number = higher priority."
            {...register('sort_order')}
          />
        </div>
      </FormSection>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
