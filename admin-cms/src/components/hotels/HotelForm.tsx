// ─── Shared hotel form ─────────────────────────────────────────────────────
// Used by both HotelCreatePage and HotelEditPage.
// All fields map 1-to-1 to the `hotels` table columns.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { FormSection } from '@/components/ui/FormSection';
import { destinationsService } from '@/services/destinations.service';
import type { Destination, Hotel } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────
// All numeric/nullable DB fields kept as strings – coerced on submit.

export interface HotelFormValues {
  destination_id: string;
  slug: string;
  name: string;
  destination_label_ko: string;
  destination_label_en: string;
  destination_label_vi: string;
  address_full_ko: string;
  address_full_en: string;
  address_full_vi: string;
  hotel_type_label_ko: string;
  hotel_type_label_en: string;
  hotel_type_label_vi: string;
  star_rating: string;
  cover_image_url: string;
  short_description_ko: string;
  short_description_en: string;
  short_description_vi: string;
  rating: string;
  review_count: string;
  nightly_from_price: string;
  currency: string;
  check_in_time: string;
  check_out_time: string;
  cancellation_policy_label_ko: string;
  cancellation_policy_label_en: string;
  cancellation_policy_label_vi: string;
  pets_policy_label_ko: string;
  pets_policy_label_en: string;
  pets_policy_label_vi: string;
  smoking_policy_label_ko: string;
  smoking_policy_label_en: string;
  smoking_policy_label_vi: string;
  policy_notice_ko: string;
  policy_notice_en: string;
  policy_notice_vi: string;
  is_recommended: boolean;
  is_active: boolean;
  sort_order: string;
}

/** Convert an existing Hotel record into form defaults. */
export function hotelToFormValues(h: Hotel): HotelFormValues {
  return {
    destination_id: String(h.destination_id),
    slug: h.slug ?? '',
    name: h.name ?? '',
    destination_label_ko: h.destination_label_ko ?? '',
    destination_label_en: h.destination_label_en ?? '',
    destination_label_vi: h.destination_label_vi ?? '',
    address_full_ko: h.address_full_ko ?? '',
    address_full_en: h.address_full_en ?? '',
    address_full_vi: h.address_full_vi ?? '',
    hotel_type_label_ko: h.hotel_type_label_ko ?? '',
    hotel_type_label_en: h.hotel_type_label_en ?? '',
    hotel_type_label_vi: h.hotel_type_label_vi ?? '',
    star_rating: h.star_rating != null ? String(h.star_rating) : '',
    cover_image_url: h.cover_image_url ?? '',
    short_description_ko: h.short_description_ko ?? '',
    short_description_en: h.short_description_en ?? '',
    short_description_vi: h.short_description_vi ?? '',
    rating: h.rating ?? '',
    review_count: String(h.review_count ?? ''),
    nightly_from_price: h.nightly_from_price ?? '',
    currency: h.currency ?? '',
    check_in_time: h.check_in_time ?? '',
    check_out_time: h.check_out_time ?? '',
    cancellation_policy_label_ko: h.cancellation_policy_label_ko ?? '',
    cancellation_policy_label_en: h.cancellation_policy_label_en ?? '',
    cancellation_policy_label_vi: h.cancellation_policy_label_vi ?? '',
    pets_policy_label_ko: h.pets_policy_label_ko ?? '',
    pets_policy_label_en: h.pets_policy_label_en ?? '',
    pets_policy_label_vi: h.pets_policy_label_vi ?? '',
    smoking_policy_label_ko: h.smoking_policy_label_ko ?? '',
    smoking_policy_label_en: h.smoking_policy_label_en ?? '',
    smoking_policy_label_vi: h.smoking_policy_label_vi ?? '',
    policy_notice_ko: h.policy_notice_ko ?? '',
    policy_notice_en: h.policy_notice_en ?? '',
    policy_notice_vi: h.policy_notice_vi ?? '',
    is_recommended: h.is_recommended,
    is_active: h.is_active,
    sort_order: String(h.sort_order ?? 0),
  };
}

export const HOTEL_EMPTY_DEFAULTS: HotelFormValues = {
  destination_id: '',
  slug: '',
  name: '',
  destination_label_ko: '', destination_label_en: '', destination_label_vi: '',
  address_full_ko: '', address_full_en: '', address_full_vi: '',
  hotel_type_label_ko: '', hotel_type_label_en: '', hotel_type_label_vi: '',
  star_rating: '',
  cover_image_url: '',
  short_description_ko: '', short_description_en: '', short_description_vi: '',
  rating: '', review_count: '',
  nightly_from_price: '', currency: '',
  check_in_time: '', check_out_time: '',
  cancellation_policy_label_ko: '', cancellation_policy_label_en: '', cancellation_policy_label_vi: '',
  pets_policy_label_ko: '', pets_policy_label_en: '', pets_policy_label_vi: '',
  smoking_policy_label_ko: '', smoking_policy_label_en: '', smoking_policy_label_vi: '',
  policy_notice_ko: '', policy_notice_en: '', policy_notice_vi: '',
  is_recommended: false,
  is_active: true,
  sort_order: '0',
};

// ─── Component ────────────────────────────────────────────────────────────

interface HotelFormProps {
  defaultValues?: HotelFormValues;
  onSubmit: (values: HotelFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function HotelForm({
  defaultValues = HOTEL_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save hotel',
  serverError,
}: HotelFormProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => setDestinations(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<HotelFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Identity ── */}
      <FormSection title="Identity" description="The destination this hotel belongs to and its URL slug.">
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
            placeholder="grand-palace-hotel"
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

      {/* ── Name & Display ── */}
      <FormSection title="Name & Display" description="Hotel name and the destination label displayed on rooms and listing cards.">
        <Input
          label="Hotel name"
          required
          placeholder="Grand Palace Hotel"
          className="mb-4"
          error={errors.name?.message}
          {...register('name', { required: 'Hotel name is required.' })}
        />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Destination label (KO)" placeholder="하노이" {...register('destination_label_ko')} />
          <Input label="Destination label (EN)" placeholder="Hanoi" {...register('destination_label_en')} />
          <Input label="Destination label (VI)" placeholder="Hà Nội" {...register('destination_label_vi')} />
        </div>
      </FormSection>

      {/* ── Address ── */}
      <FormSection title="Address" description="Full address shown on the hotel detail page.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea label="Address (KO)" rows={2} placeholder="1 호안끼엠 거리, 하노이" {...register('address_full_ko')} />
          <Textarea label="Address (EN)" rows={2} placeholder="1 Hoan Kiem St, Hanoi" {...register('address_full_en')} />
          <Textarea label="Address (VI)" rows={2} placeholder="1 Phố Hoàn Kiếm, Hà Nội" {...register('address_full_vi')} />
        </div>
      </FormSection>

      {/* ── Hotel Type & Stars ── */}
      <FormSection title="Hotel Type & Stars" description="Type classification shown on cards and the star rating.">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Input label="Type label (KO)" placeholder="럭셔리 호텔" {...register('hotel_type_label_ko')} />
          <Input label="Type label (EN)" placeholder="Luxury Hotel" {...register('hotel_type_label_en')} />
          <Input label="Type label (VI)" placeholder="Khách sạn sang trọng" {...register('hotel_type_label_vi')} />
        </div>
        <Controller
          name="star_rating"
          control={control}
          render={({ field }) => (
            <Select label="Star rating" className="w-40" {...field}>
              <option value="">— unrated —</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={String(n)}>{n} star{n > 1 ? 's' : ''}</option>
              ))}
            </Select>
          )}
        />
      </FormSection>

      {/* ── Cover Image ── */}
      <FormSection title="Cover Image" description="Primary image shown on hotel cards and detail pages.">
        <Input
          label="Cover image URL"
          placeholder="/uploads/hotels/grand-palace-cover.jpg"
          hint="Enter a path or full URL. Image management available below after saving."
          {...register('cover_image_url')}
        />
      </FormSection>

      {/* ── Short Description ── */}
      <FormSection title="Short Description" description="One or two sentences shown on listing cards.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea label="Short desc (KO)" rows={3} placeholder="하노이 중심부에 위치한 5성급 호텔." {...register('short_description_ko')} />
          <Textarea label="Short desc (EN)" rows={3} placeholder="5-star hotel in the heart of Hanoi." {...register('short_description_en')} />
          <Textarea label="Short desc (VI)" rows={3} placeholder="Khách sạn 5 sao ở trung tâm Hà Nội." {...register('short_description_vi')} />
        </div>
      </FormSection>

      {/* ── Stats & Pricing ── */}
      <FormSection title="Stats & Pricing" description="Rating, review count and nightly pricing shown on listing cards.">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="4.7"
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
            placeholder="1240"
            {...register('review_count')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nightly from price"
            placeholder="2500000"
            hint="Numeric amount (no currency symbol)."
            {...register('nightly_from_price')}
          />
          <Input
            label="Currency"
            placeholder="VND"
            hint="ISO currency code, e.g. VND, USD, KRW."
            {...register('currency')}
          />
        </div>
      </FormSection>

      {/* ── Check-in / Check-out ── */}
      <FormSection title="Check-in / Check-out" description="Standard times displayed on the hotel detail page.">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Check-in time"
            placeholder="14:00"
            hint="e.g. 14:00 or 2 PM"
            {...register('check_in_time')}
          />
          <Input
            label="Check-out time"
            placeholder="12:00"
            hint="e.g. 12:00 or noon"
            {...register('check_out_time')}
          />
        </div>
      </FormSection>

      {/* ── Policies ── */}
      <FormSection title="Policies" description="Cancellation, pet, smoking policies and any additional notice.">
        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Cancellation policy</p>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Input label="Cancellation (KO)" placeholder="무료 취소 가능" {...register('cancellation_policy_label_ko')} />
          <Input label="Cancellation (EN)" placeholder="Free cancellation" {...register('cancellation_policy_label_en')} />
          <Input label="Cancellation (VI)" placeholder="Miễn phí hủy phòng" {...register('cancellation_policy_label_vi')} />
        </div>

        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Pets policy</p>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Input label="Pets (KO)" placeholder="반려동물 불가" {...register('pets_policy_label_ko')} />
          <Input label="Pets (EN)" placeholder="No pets allowed" {...register('pets_policy_label_en')} />
          <Input label="Pets (VI)" placeholder="Không cho phép thú cưng" {...register('pets_policy_label_vi')} />
        </div>

        <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Smoking policy</p>
        <div className="grid grid-cols-3 gap-4 mb-5">
          <Input label="Smoking (KO)" placeholder="금연 구역" {...register('smoking_policy_label_ko')} />
          <Input label="Smoking (EN)" placeholder="Non-smoking property" {...register('smoking_policy_label_en')} />
          <Input label="Smoking (VI)" placeholder="Cấm hút thuốc" {...register('smoking_policy_label_vi')} />
        </div>

        <p className="text-xs font-medium text-slate-500 mt-4 mb-2 uppercase tracking-wide">Policy notice</p>
        <div className="grid grid-cols-3 gap-4">
          <Textarea label="Policy notice (KO)" rows={2} placeholder="취소 및 환불 규정 안내…" {...register('policy_notice_ko')} />
          <Textarea label="Policy notice (EN)" rows={2} placeholder="Please review cancellation terms…" {...register('policy_notice_en')} />
          <Textarea label="Policy notice (VI)" rows={2} placeholder="Vui lòng xem điều khoản hủy phòng…" {...register('policy_notice_vi')} />
        </div>
      </FormSection>

      {/* ── Publishing ── */}
      <FormSection title="Publishing" description="Visibility, recommendation status and display ordering.">
        <div className="flex flex-wrap items-start gap-6">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Active"
                checked={field.value}
                onChange={field.onChange}
                description="Inactive hotels are hidden from users."
              />
            )}
          />
          <Controller
            name="is_recommended"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Recommended"
                checked={field.value}
                onChange={field.onChange}
                description="Featured in recommended sections."
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
