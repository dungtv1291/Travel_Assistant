// ─── Shared destination form ─────────────────────────────────────────────
// Used by both DestinationCreatePage and DestinationEditPage.
// All fields map 1-to-1 to the `destinations` table columns.

import { useForm, Controller } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { FormSection } from '@/components/ui/FormSection';
import type { Destination } from '@/types';

// ─── Form value shape ─────────────────────────────────────────────────────
// All numeric DB fields are kept as strings here – coerced on submit.

export interface DestinationFormValues {
  slug: string;
  code: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  region_label_ko: string;
  region_label_en: string;
  region_label_vi: string;
  country_label_ko: string;
  country_label_en: string;
  country_label_vi: string;
  hero_image_url: string;
  rating: string;
  review_count: string;
  match_percent: string;
  short_description_ko: string;
  short_description_en: string;
  short_description_vi: string;
  overview_description_ko: string;
  overview_description_en: string;
  overview_description_vi: string;
  best_season_label_ko: string;
  best_season_label_en: string;
  best_season_label_vi: string;
  average_temperature_c: string;
  language_label_ko: string;
  language_label_en: string;
  language_label_vi: string;
  currency_label_ko: string;
  currency_label_en: string;
  currency_label_vi: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: string;
}

/** Convert an existing Destination record into form defaults. */
export function destinationToFormValues(d: Destination): DestinationFormValues {
  return {
    slug: d.slug ?? '',
    code: d.code ?? '',
    name_ko: d.name_ko ?? '',
    name_en: d.name_en ?? '',
    name_vi: d.name_vi ?? '',
    region_label_ko: d.region_label_ko ?? '',
    region_label_en: d.region_label_en ?? '',
    region_label_vi: d.region_label_vi ?? '',
    country_label_ko: d.country_label_ko ?? '',
    country_label_en: d.country_label_en ?? '',
    country_label_vi: d.country_label_vi ?? '',
    hero_image_url: d.hero_image_url ?? '',
    rating: d.rating ?? '',
    review_count: String(d.review_count ?? ''),
    match_percent: d.match_percent != null ? String(d.match_percent) : '',
    short_description_ko: d.short_description_ko ?? '',
    short_description_en: d.short_description_en ?? '',
    short_description_vi: d.short_description_vi ?? '',
    overview_description_ko: d.overview_description_ko ?? '',
    overview_description_en: d.overview_description_en ?? '',
    overview_description_vi: d.overview_description_vi ?? '',
    best_season_label_ko: d.best_season_label_ko ?? '',
    best_season_label_en: d.best_season_label_en ?? '',
    best_season_label_vi: d.best_season_label_vi ?? '',
    average_temperature_c: d.average_temperature_c != null ? String(d.average_temperature_c) : '',
    language_label_ko: d.language_label_ko ?? '',
    language_label_en: d.language_label_en ?? '',
    language_label_vi: d.language_label_vi ?? '',
    currency_label_ko: d.currency_label_ko ?? '',
    currency_label_en: d.currency_label_en ?? '',
    currency_label_vi: d.currency_label_vi ?? '',
    is_featured: d.is_featured,
    is_active: d.is_active,
    sort_order: String(d.sort_order ?? 0),
  };
}

const EMPTY_DEFAULTS: DestinationFormValues = {
  slug: '', code: '',
  name_ko: '', name_en: '', name_vi: '',
  region_label_ko: '', region_label_en: '', region_label_vi: '',
  country_label_ko: '', country_label_en: '', country_label_vi: '',
  hero_image_url: '',
  rating: '', review_count: '', match_percent: '',
  short_description_ko: '', short_description_en: '', short_description_vi: '',
  overview_description_ko: '', overview_description_en: '', overview_description_vi: '',
  best_season_label_ko: '', best_season_label_en: '', best_season_label_vi: '',
  average_temperature_c: '',
  language_label_ko: '', language_label_en: '', language_label_vi: '',
  currency_label_ko: '', currency_label_en: '', currency_label_vi: '',
  is_featured: false, is_active: true,
  sort_order: '0',
};

// ─── Component ────────────────────────────────────────────────────────────

interface DestinationFormProps {
  defaultValues?: DestinationFormValues;
  onSubmit: (values: DestinationFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

export function DestinationForm({
  defaultValues = EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save destination',
  serverError,
}: DestinationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormValues>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Identity ── */}
      <FormSection title="Identity" description="Unique identifiers used in URLs and the API.">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Slug"
            required
            placeholder="hoi-an"
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
          <Input
            label="Code"
            placeholder="HOI-AN"
            hint="Optional short code for internal reference."
            {...register('code')}
          />
        </div>
      </FormSection>

      {/* ── Names ── */}
      <FormSection title="Names" description="Display name in each supported language.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Name (Korean)"
            required
            placeholder="호이안"
            error={errors.name_ko?.message}
            {...register('name_ko', { required: 'Korean name is required.' })}
          />
          <Input
            label="Name (English)"
            required
            placeholder="Hoi An"
            error={errors.name_en?.message}
            {...register('name_en', { required: 'English name is required.' })}
          />
          <Input
            label="Name (Vietnamese)"
            required
            placeholder="Hội An"
            error={errors.name_vi?.message}
            {...register('name_vi', { required: 'Vietnamese name is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Region & Country ── */}
      <FormSection title="Region & Country" description="Display labels shown in destination cards and detail pages.">
        <div className="grid grid-cols-3 gap-4">
          <Input label="Region (KO)" placeholder="베트남 중부" {...register('region_label_ko')} />
          <Input label="Region (EN)" placeholder="Central Vietnam" {...register('region_label_en')} />
          <Input label="Region (VI)" placeholder="Miền Trung Việt Nam" {...register('region_label_vi')} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Country (KO)" placeholder="베트남" {...register('country_label_ko')} />
          <Input label="Country (EN)" placeholder="Vietnam" {...register('country_label_en')} />
          <Input label="Country (VI)" placeholder="Việt Nam" {...register('country_label_vi')} />
        </div>
      </FormSection>

      {/* ── Hero Image ── */}
      <FormSection title="Hero Image" description="Primary cover image shown at the top of the destination detail page.">
        <Input
          label="Hero image URL"
          placeholder="/uploads/destinations/hoi-an-cover.jpg"
          hint="Enter a path or full URL. Image upload support coming later."
          {...register('hero_image_url')}
        />
      </FormSection>

      {/* ── Stats ── */}
      <FormSection title="Stats & Metrics" description="Displayed on destination cards and overview panels.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="4.8"
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
            placeholder="12400"
            {...register('review_count')}
          />
          <Input
            label="Match %"
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder="32"
            hint="Personalisation match score (0–100)."
            error={errors.match_percent?.message}
            {...register('match_percent', {
              validate: (v) =>
                !v || (parseInt(v) >= 0 && parseInt(v) <= 100) || 'Must be between 0 and 100.',
            })}
          />
        </div>
      </FormSection>

      {/* ── Short Descriptions ── */}
      <FormSection title="Short Description" description="One or two sentences shown on listing cards and search results.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Short desc (KO)"
            rows={3}
            placeholder="호이안은 유네스코 세계유산 고도시입니다."
            {...register('short_description_ko')}
          />
          <Textarea
            label="Short desc (EN)"
            rows={3}
            placeholder="Hoi An is a UNESCO World Heritage ancient town."
            {...register('short_description_en')}
          />
          <Textarea
            label="Short desc (VI)"
            rows={3}
            placeholder="Hội An là phố cổ di sản thế giới UNESCO."
            {...register('short_description_vi')}
          />
        </div>
      </FormSection>

      {/* ── Overview Descriptions ── */}
      <FormSection title="Overview Description" description="Full-length body text shown on the destination detail overview tab.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Overview (KO)"
            rows={6}
            placeholder="전체 개요 (한국어)…"
            {...register('overview_description_ko')}
          />
          <Textarea
            label="Overview (EN)"
            rows={6}
            placeholder="Full overview (English)…"
            {...register('overview_description_en')}
          />
          <Textarea
            label="Overview (VI)"
            rows={6}
            placeholder="Tổng quan đầy đủ (Tiếng Việt)…"
            {...register('overview_description_vi')}
          />
        </div>
      </FormSection>

      {/* ── Travel Info ── */}
      <FormSection title="Travel Information" description="Practical info shown in the destination info panel.">
        {/* Best season */}
        <div className="grid grid-cols-3 gap-4">
          <Input label="Best season (KO)" placeholder="2월 - 8월" {...register('best_season_label_ko')} />
          <Input label="Best season (EN)" placeholder="Feb – Aug" {...register('best_season_label_en')} />
          <Input label="Best season (VI)" placeholder="Tháng 2 – 8" {...register('best_season_label_vi')} />
        </div>

        {/* Avg temp */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Avg temperature (°C)"
            type="number"
            step="1"
            placeholder="28"
            {...register('average_temperature_c')}
          />
        </div>

        {/* Language */}
        <div className="grid grid-cols-3 gap-4">
          <Input label="Language (KO)" placeholder="베트남어" {...register('language_label_ko')} />
          <Input label="Language (EN)" placeholder="Vietnamese" {...register('language_label_en')} />
          <Input label="Language (VI)" placeholder="Tiếng Việt" {...register('language_label_vi')} />
        </div>

        {/* Currency */}
        <div className="grid grid-cols-3 gap-4">
          <Input label="Currency (KO)" placeholder="VND (동)" {...register('currency_label_ko')} />
          <Input label="Currency (EN)" placeholder="VND (Dong)" {...register('currency_label_en')} />
          <Input label="Currency (VI)" placeholder="VND (Đồng)" {...register('currency_label_vi')} />
        </div>
      </FormSection>

      {/* ── Publishing ── */}
      <FormSection title="Publishing & Sort" description="Control visibility and listing order.">
        <div className="flex items-center gap-10">
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Toggle
                label="Active"
                description="Visible to app users"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="is_featured"
            render={({ field }) => (
              <Toggle
                label="Featured"
                description="Shown in featured destinations carousel"
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Input
            label="Sort order"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            hint="Lower numbers appear first."
            {...register('sort_order')}
          />
        </div>
      </FormSection>

      {/* ── Submit ── */}
      <div className="flex justify-end pt-2">
        <Button type="submit" size="md" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
