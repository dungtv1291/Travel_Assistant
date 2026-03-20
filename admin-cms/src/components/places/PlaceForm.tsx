// ─── Shared place form ────────────────────────────────────────────────────
// Used by both PlaceCreatePage and PlaceEditPage.
// All fields map 1-to-1 to the `places` table columns.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { FormSection } from '@/components/ui/FormSection';
import { destinationsService } from '@/services/destinations.service';
import type { Destination, Place } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────
// All numeric/nullable DB fields are kept as strings – coerced on submit.

export interface PlaceFormValues {
  destination_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  category_label_ko: string;
  category_label_en: string;
  category_label_vi: string;
  cover_image_url: string;
  short_description_ko: string;
  short_description_en: string;
  short_description_vi: string;
  rating: string;
  review_count: string;
  visit_duration_label_ko: string;
  visit_duration_label_en: string;
  visit_duration_label_vi: string;
  ticket_price_amount: string;
  ticket_price_currency: string;
  lat: string;
  lng: string;
  is_active: boolean;
  sort_order: string;
}

/** Convert an existing Place record into form defaults. */
export function placeToFormValues(p: Place): PlaceFormValues {
  return {
    destination_id: String(p.destination_id),
    slug: p.slug ?? '',
    name_ko: p.name_ko ?? '',
    name_en: p.name_en ?? '',
    name_vi: p.name_vi ?? '',
    category_label_ko: p.category_label_ko ?? '',
    category_label_en: p.category_label_en ?? '',
    category_label_vi: p.category_label_vi ?? '',
    cover_image_url: p.cover_image_url ?? '',
    short_description_ko: p.short_description_ko ?? '',
    short_description_en: p.short_description_en ?? '',
    short_description_vi: p.short_description_vi ?? '',
    rating: p.rating ?? '',
    review_count: String(p.review_count ?? ''),
    visit_duration_label_ko: p.visit_duration_label_ko ?? '',
    visit_duration_label_en: p.visit_duration_label_en ?? '',
    visit_duration_label_vi: p.visit_duration_label_vi ?? '',
    ticket_price_amount: p.ticket_price_amount ?? '',
    ticket_price_currency: p.ticket_price_currency ?? '',
    lat: p.lat ?? '',
    lng: p.lng ?? '',
    is_active: p.is_active,
    sort_order: String(p.sort_order ?? 0),
  };
}

export const PLACE_EMPTY_DEFAULTS: PlaceFormValues = {
  destination_id: '',
  slug: '',
  name_ko: '', name_en: '', name_vi: '',
  category_label_ko: '', category_label_en: '', category_label_vi: '',
  cover_image_url: '',
  short_description_ko: '', short_description_en: '', short_description_vi: '',
  rating: '', review_count: '',
  visit_duration_label_ko: '', visit_duration_label_en: '', visit_duration_label_vi: '',
  ticket_price_amount: '', ticket_price_currency: '',
  lat: '', lng: '',
  is_active: true,
  sort_order: '0',
};

// ─── Component ────────────────────────────────────────────────────────────

interface PlaceFormProps {
  defaultValues?: PlaceFormValues;
  onSubmit: (values: PlaceFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function PlaceForm({
  defaultValues = PLACE_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save place',
  serverError,
}: PlaceFormProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => setDestinations(res.items))
      .catch(() => {/* non-fatal – dropdown stays empty */});
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PlaceFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Identity ── */}
      <FormSection title="Identity" description="The destination this place belongs to and its URL slug.">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="destination_id"
            control={control}
            rules={{ required: 'Destination is required.' }}
            render={({ field }) => (
              <Select
                label="Destination"
                required
                error={errors.destination_id?.message}
                {...field}
              >
                <option value="">— select destination —</option>
                {destinations.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name_en} ({d.slug})
                  </option>
                ))}
              </Select>
            )}
          />
          <Input
            label="Slug"
            required
            placeholder="my-sơn-sanctuary"
            hint="URL-safe identifier – lowercase letters, numbers and hyphens only."
            error={errors.slug?.message}
            {...register('slug', {
              required: 'Slug is required.',
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Use only lowercase letters, numbers, and hyphens.',
              },
            })}
          />
        </div>
      </FormSection>

      {/* ── Names ── */}
      <FormSection title="Names" description="Display name in each supported language.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Name (Korean)"
            required
            placeholder="미선 성지"
            error={errors.name_ko?.message}
            {...register('name_ko', { required: 'Korean name is required.' })}
          />
          <Input
            label="Name (English)"
            required
            placeholder="My Son Sanctuary"
            error={errors.name_en?.message}
            {...register('name_en', { required: 'English name is required.' })}
          />
          <Input
            label="Name (Vietnamese)"
            required
            placeholder="Thánh địa Mỹ Sơn"
            error={errors.name_vi?.message}
            {...register('name_vi', { required: 'Vietnamese name is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Category ── */}
      <FormSection title="Category" description="Category label shown on place cards and filters.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Category (KO)" placeholder="유적지" {...register('category_label_ko')} />
          <Input label="Category (EN)" placeholder="Historical Site" {...register('category_label_en')} />
          <Input label="Category (VI)" placeholder="Di tích lịch sử" {...register('category_label_vi')} />
        </div>
      </FormSection>

      {/* ── Cover Image ── */}
      <FormSection title="Cover Image" description="Primary image shown on place cards and detail pages.">
        <Input
          label="Cover image URL"
          placeholder="/uploads/places/my-son-cover.jpg"
          hint="Enter a path or full URL. Image upload support coming later."
          {...register('cover_image_url')}
        />
      </FormSection>

      {/* ── Short Description ── */}
      <FormSection title="Short Description" description="One or two sentences shown on listing cards and search results.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Short desc (KO)"
            rows={3}
            placeholder="미선 성지는 세계유산입니다."
            {...register('short_description_ko')}
          />
          <Textarea
            label="Short desc (EN)"
            rows={3}
            placeholder="My Son Sanctuary is a UNESCO World Heritage site."
            {...register('short_description_en')}
          />
          <Textarea
            label="Short desc (VI)"
            rows={3}
            placeholder="Thánh địa Mỹ Sơn là di sản UNESCO."
            {...register('short_description_vi')}
          />
        </div>
      </FormSection>

      {/* ── Stats ── */}
      <FormSection title="Stats & Metrics" description="Rating and review count displayed on place cards.">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="4.5"
            hint="0.0 – 5.0"
            error={errors.rating?.message}
            {...register('rating', {
              validate: (v) =>
                !v || (parseFloat(v) >= 0 && parseFloat(v) <= 5) || 'Rating must be between 0 and 5.',
            })}
          />
          <Input
            label="Review count"
            type="number"
            min="0"
            step="1"
            placeholder="850"
            {...register('review_count')}
          />
        </div>
      </FormSection>

      {/* ── Visit & Pricing ── */}
      <FormSection title="Visit & Pricing" description="Visit duration labels and ticket pricing information.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Duration (KO)" placeholder="2-3시간" {...register('visit_duration_label_ko')} />
          <Input label="Duration (EN)" placeholder="2–3 hours" {...register('visit_duration_label_en')} />
          <Input label="Duration (VI)" placeholder="2–3 giờ" {...register('visit_duration_label_vi')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ticket price"
            placeholder="150000"
            hint="Numeric amount (no currency symbol)."
            {...register('ticket_price_amount')}
          />
          <Input
            label="Currency"
            placeholder="VND"
            hint="ISO currency code, e.g. VND, USD."
            {...register('ticket_price_currency')}
          />
        </div>
      </FormSection>

      {/* ── Location ── */}
      <FormSection title="Location" description="GPS coordinates for map display.">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="15.7767"
            {...register('lat')}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="108.1230"
            {...register('lng')}
          />
        </div>
      </FormSection>

      {/* ── Publishing ── */}
      <FormSection title="Publishing" description="Visibility and display ordering.">
        <div className="flex flex-wrap items-start gap-6">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Active"
                checked={field.value}
                onChange={field.onChange}
                description="Inactive places are hidden from users."
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
