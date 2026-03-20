// ─── Hotel Review form ─────────────────────────────────────────────────────
// Used by both HotelReviewCreatePage and HotelReviewEditPage.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { FormSection } from '@/components/ui/FormSection';
import { hotelsService } from '@/services/hotels.service';
import type { Hotel, HotelReview } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────

export interface HotelReviewFormValues {
  hotel_id: string;
  reviewer_name: string;
  reviewer_initial: string;
  rating: string;
  review_date: string;
  content_ko: string;
  content_en: string;
  content_vi: string;
  is_active: boolean;
}

export function reviewToFormValues(r: HotelReview): HotelReviewFormValues {
  return {
    hotel_id: String(r.hotel_id),
    reviewer_name: r.reviewer_name,
    reviewer_initial: r.reviewer_initial ?? '',
    rating: String(r.rating),
    review_date: r.review_date ?? '',
    content_ko: r.content_ko ?? '',
    content_en: r.content_en ?? '',
    content_vi: r.content_vi ?? '',
    is_active: r.is_active,
  };
}

export const REVIEW_EMPTY_DEFAULTS: HotelReviewFormValues = {
  hotel_id: '',
  reviewer_name: '',
  reviewer_initial: '',
  rating: '5.0',
  review_date: '',
  content_ko: '', content_en: '', content_vi: '',
  is_active: true,
};

// ─── Component ────────────────────────────────────────────────────────────

interface HotelReviewFormProps {
  defaultValues?: HotelReviewFormValues;
  onSubmit: (values: HotelReviewFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function HotelReviewForm({
  defaultValues = REVIEW_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save review',
  serverError,
}: HotelReviewFormProps) {
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
  } = useForm<HotelReviewFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Hotel ── */}
      <FormSection title="Hotel" description="The hotel this review belongs to.">
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

      {/* ── Reviewer ── */}
      <FormSection title="Reviewer" description="Name and optional initial shown on the review card.">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <Input
            label="Reviewer name"
            required
            placeholder="김민준"
            error={errors.reviewer_name?.message}
            {...register('reviewer_name', { required: 'Reviewer name is required.' })}
          />
          <Input
            label="Reviewer initial"
            placeholder="K"
            hint="Single letter shown as avatar (optional)."
            maxLength={10}
            {...register('reviewer_initial')}
          />
        </div>
      </FormSection>

      {/* ── Rating & Date ── */}
      <FormSection title="Rating & Date" description="Numeric rating and the date the review was written.">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Input
            label="Rating"
            required
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="4.5"
            hint="0.0 – 5.0"
            error={errors.rating?.message}
            {...register('rating', {
              required: 'Rating is required.',
              validate: (v) =>
                (parseFloat(v) >= 0 && parseFloat(v) <= 5) || 'Rating must be between 0 and 5.',
            })}
          />
          <Input
            label="Review date"
            required
            type="date"
            error={errors.review_date?.message}
            {...register('review_date', { required: 'Review date is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Review Content ── */}
      <FormSection title="Review Content" description="Guest review text in each language. All fields are optional.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Content (KO)"
            rows={4}
            placeholder="정말 멋진 호텔입니다…"
            {...register('content_ko')}
          />
          <Textarea
            label="Content (EN)"
            rows={4}
            placeholder="Amazing hotel experience…"
            {...register('content_en')}
          />
          <Textarea
            label="Content (VI)"
            rows={4}
            placeholder="Khách sạn tuyệt vời…"
            {...register('content_vi')}
          />
        </div>
      </FormSection>

      {/* ── Publishing ── */}
      <FormSection title="Publishing" description="Controls whether this review is shown to users.">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Toggle
              label="Active"
              checked={field.value}
              onChange={field.onChange}
              description="Inactive reviews are hidden from users."
            />
          )}
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
