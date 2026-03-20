// ─── Transport Service Form ─────────────────────────────────────────────────
// Reusable create / edit form for transport_services table.

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormSection } from '@/components/ui/FormSection';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { destinationsService } from '@/services/destinations.service';
import type { Destination, TransportService } from '@/types';

// ── Service type options ────────────────────────────────────────────────────

const SERVICE_TYPE_OPTIONS = [
  { value: 'airport_pickup', label: 'Airport Pickup' },
  { value: 'private_car',   label: 'Private Car' },
  { value: 'self_drive',    label: 'Self Drive' },
  { value: 'scooter',       label: 'Scooter' },
  { value: 'day_trip',      label: 'Day Trip' },
];

// ── Form value types ────────────────────────────────────────────────────────

export interface TransportFormValues {
  destination_id: string;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  service_type: string;
  vehicle_model: string;
  transmission_label_ko: string;
  transmission_label_en: string;
  transmission_label_vi: string;
  capacity: string;
  luggage_count: string;
  with_driver: boolean;
  driver_mode_label_ko: string;
  driver_mode_label_en: string;
  driver_mode_label_vi: string;
  cover_image_url: string;
  rating: string;
  review_count: string;
  description_ko: string;
  description_en: string;
  description_vi: string;
  insurance_notice_ko: string;
  insurance_notice_en: string;
  insurance_notice_vi: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: string;
}

export function transportToFormValues(t: TransportService): TransportFormValues {
  return {
    destination_id: t.destination_id != null ? String(t.destination_id) : '',
    slug: t.slug,
    name_ko: t.name_ko,
    name_en: t.name_en,
    name_vi: t.name_vi,
    service_type: t.service_type,
    vehicle_model: t.vehicle_model ?? '',
    transmission_label_ko: t.transmission_label_ko ?? '',
    transmission_label_en: t.transmission_label_en ?? '',
    transmission_label_vi: t.transmission_label_vi ?? '',
    capacity: t.capacity != null ? String(t.capacity) : '',
    luggage_count: t.luggage_count != null ? String(t.luggage_count) : '',
    with_driver: t.with_driver,
    driver_mode_label_ko: t.driver_mode_label_ko ?? '',
    driver_mode_label_en: t.driver_mode_label_en ?? '',
    driver_mode_label_vi: t.driver_mode_label_vi ?? '',
    cover_image_url: t.cover_image_url ?? '',
    rating: t.rating != null ? String(t.rating) : '',
    review_count: String(t.review_count ?? 0),
    description_ko: t.description_ko ?? '',
    description_en: t.description_en ?? '',
    description_vi: t.description_vi ?? '',
    insurance_notice_ko: t.insurance_notice_ko ?? '',
    insurance_notice_en: t.insurance_notice_en ?? '',
    insurance_notice_vi: t.insurance_notice_vi ?? '',
    is_popular: t.is_popular,
    is_active: t.is_active,
    sort_order: String(t.sort_order ?? 0),
  };
}

export const TRANSPORT_EMPTY_DEFAULTS: TransportFormValues = {
  destination_id: '',
  slug: '',
  name_ko: '', name_en: '', name_vi: '',
  service_type: 'private_car',
  vehicle_model: '',
  transmission_label_ko: '', transmission_label_en: '', transmission_label_vi: '',
  capacity: '', luggage_count: '',
  with_driver: false,
  driver_mode_label_ko: '', driver_mode_label_en: '', driver_mode_label_vi: '',
  cover_image_url: '',
  rating: '', review_count: '0',
  description_ko: '', description_en: '', description_vi: '',
  insurance_notice_ko: '', insurance_notice_en: '', insurance_notice_vi: '',
  is_popular: false,
  is_active: true,
  sort_order: '0',
};

// ── Component props ─────────────────────────────────────────────────────────

interface TransportFormProps {
  defaultValues?: TransportFormValues;
  onSubmit: (values: TransportFormValues) => Promise<void>;
  submitLabel?: string;
  serverError?: string;
}

// ── Component ───────────────────────────────────────────────────────────────

export function TransportForm({
  defaultValues = TRANSPORT_EMPTY_DEFAULTS,
  onSubmit,
  submitLabel = 'Save service',
  serverError,
}: TransportFormProps) {
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransportFormValues>({ defaultValues });

  const withDriver = watch('with_driver');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Destination ──────────────────────────────────────────────────── */}
      <FormSection title="Destination" description="Associate this service with a destination (optional).">
        <Controller
          name="destination_id"
          control={control}
          render={({ field }) => (
            <Select label="Destination" className="max-w-xs" {...field}>
              <option value="">— no destination —</option>
              {destinations.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name_en} ({d.slug})
                </option>
              ))}
            </Select>
          )}
        />
      </FormSection>

      {/* ── Identity ─────────────────────────────────────────────────────── */}
      <FormSection title="Identity" description="Unique slug and service classification.">
        <div className="grid grid-cols-2 gap-4 max-w-lg">
          <Input
            label="Slug"
            required
            placeholder="da-nang-airport-pickup"
            hint="Lowercase letters, numbers and hyphens only."
            error={errors.slug?.message}
            {...register('slug', { required: 'Slug is required.' })}
          />
          <Controller
            name="service_type"
            control={control}
            rules={{ required: 'Service type is required.' }}
            render={({ field }) => (
              <Select
                label="Service type"
                required
                error={errors.service_type?.message}
                {...field}
              >
                {SERVICE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            )}
          />
        </div>
      </FormSection>

      {/* ── Names ────────────────────────────────────────────────────────── */}
      <FormSection title="Service Name" description="Multilingual name shown on listing cards.">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Name (KO)"
            required
            placeholder="다낭 공항 픽업"
            error={errors.name_ko?.message}
            {...register('name_ko', { required: 'Korean name is required.' })}
          />
          <Input
            label="Name (EN)"
            required
            placeholder="Da Nang Airport Pickup"
            error={errors.name_en?.message}
            {...register('name_en', { required: 'English name is required.' })}
          />
          <Input
            label="Name (VI)"
            required
            placeholder="Đón sân bay Đà Nẵng"
            error={errors.name_vi?.message}
            {...register('name_vi', { required: 'Vietnamese name is required.' })}
          />
        </div>
      </FormSection>

      {/* ── Vehicle Details ───────────────────────────────────────────────── */}
      <FormSection title="Vehicle Details" description="Make/model, capacity and luggage info.">
        <div className="grid grid-cols-3 gap-4 max-w-2xl">
          <Input
            label="Vehicle model"
            placeholder="Toyota Innova"
            {...register('vehicle_model')}
          />
          <Input
            label="Capacity (persons)"
            type="number"
            min="1"
            step="1"
            placeholder="7"
            {...register('capacity')}
          />
          <Input
            label="Luggage count"
            type="number"
            min="0"
            step="1"
            placeholder="3"
            {...register('luggage_count')}
          />
        </div>
      </FormSection>

      {/* ── Transmission ──────────────────────────────────────────────────── */}
      <FormSection
        title="Transmission"
        description="Transmission type label shown on the service card (e.g. Automatic, Manual)."
      >
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Transmission (KO)"
            placeholder="자동"
            {...register('transmission_label_ko')}
          />
          <Input
            label="Transmission (EN)"
            placeholder="Automatic"
            {...register('transmission_label_en')}
          />
          <Input
            label="Transmission (VI)"
            placeholder="Tự động"
            {...register('transmission_label_vi')}
          />
        </div>
      </FormSection>

      {/* ── Driver Mode ───────────────────────────────────────────────────── */}
      <FormSection
        title="Driver Mode"
        description="Whether this service includes a driver. The driver mode label describes how the driver/rental works (e.g. Driver included)."
      >
        <div className="space-y-4">
          <Controller
            name="with_driver"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Includes driver"
                description="Service includes a professional driver."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {withDriver && (
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Driver mode label (KO)"
                placeholder="기사 포함"
                {...register('driver_mode_label_ko')}
              />
              <Input
                label="Driver mode label (EN)"
                placeholder="Driver included"
                {...register('driver_mode_label_en')}
              />
              <Input
                label="Driver mode label (VI)"
                placeholder="Bao gồm tài xế"
                {...register('driver_mode_label_vi')}
              />
            </div>
          )}
        </div>
      </FormSection>

      {/* ── Cover Image ───────────────────────────────────────────────────── */}
      <FormSection title="Cover Image" description="Primary image for listing cards.">
        <Input
          label="Cover image URL"
          placeholder="/uploads/transports/danang-airport-pickup.jpg"
          hint="Enter a path or full URL."
          {...register('cover_image_url')}
        />
      </FormSection>

      {/* ── Ratings ───────────────────────────────────────────────────────── */}
      <FormSection title="Rating & Reviews" description="Aggregate rating and review count.">
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <Input
            label="Rating (0–5)"
            type="number"
            min="0"
            max="5"
            step="0.1"
            placeholder="4.8"
            {...register('rating')}
          />
          <Input
            label="Review count"
            type="number"
            min="0"
            step="1"
            placeholder="120"
            {...register('review_count')}
          />
        </div>
      </FormSection>

      {/* ── Descriptions ─────────────────────────────────────────────────── */}
      <FormSection title="Descriptions" description="Service description shown on detail pages.">
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Description (KO)"
            rows={4}
            placeholder="다낭 국제공항에서 호텔까지 편안한 이동…"
            {...register('description_ko')}
          />
          <Textarea
            label="Description (EN)"
            rows={4}
            placeholder="Comfortable transfer from Da Nang International Airport…"
            {...register('description_en')}
          />
          <Textarea
            label="Description (VI)"
            rows={4}
            placeholder="Dịch vụ đưa đón thoải mái từ sân bay quốc tế Đà Nẵng…"
            {...register('description_vi')}
          />
        </div>
      </FormSection>

      {/* ── Insurance Notice ─────────────────────────────────────────────── */}
      <FormSection
        title="Insurance Notice"
        description="Optional insurance or liability notice shown on the booking page."
      >
        <div className="grid grid-cols-3 gap-4">
          <Textarea
            label="Insurance notice (KO)"
            rows={3}
            placeholder="기본 여행자 보험이 포함되어 있습니다…"
            {...register('insurance_notice_ko')}
          />
          <Textarea
            label="Insurance notice (EN)"
            rows={3}
            placeholder="Basic travel insurance is included…"
            {...register('insurance_notice_en')}
          />
          <Textarea
            label="Insurance notice (VI)"
            rows={3}
            placeholder="Bảo hiểm du lịch cơ bản được bao gồm…"
            {...register('insurance_notice_vi')}
          />
        </div>
      </FormSection>

      {/* ── Publishing ───────────────────────────────────────────────────── */}
      <FormSection title="Publishing" description="Visibility and ordering settings.">
        <div className="flex flex-col gap-4">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Active"
                description="Visible in the mobile app."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            name="is_popular"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Popular"
                description="Highlighted in popular listings."
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            label="Sort order"
            type="number"
            step="1"
            className="w-28"
            {...register('sort_order')}
          />
        </div>
      </FormSection>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
