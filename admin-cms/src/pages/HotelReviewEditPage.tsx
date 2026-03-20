import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelReviewForm,
  reviewToFormValues,
  type HotelReviewFormValues,
} from '@/components/hotel-reviews/HotelReviewForm';
import { hotelReviewsService } from '@/services/hotel-reviews.service';
import { getErrorMessage } from '@/lib/api';
import type { HotelReview } from '@/types';

function coercePayload(values: HotelReviewFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    reviewer_initial: values.reviewer_initial || null,
    content_ko: values.content_ko || null,
    content_en: values.content_en || null,
    content_vi: values.content_vi || null,
  };
}

export function HotelReviewEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [review, setReview] = useState<HotelReview | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const reviewId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!reviewId) return;
    hotelReviewsService
      .get(reviewId)
      .then(setReview)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [reviewId]);

  async function handleSubmit(values: HotelReviewFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await hotelReviewsService.update(reviewId, coercePayload(values));
      setReview(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader
          title="Edit Review"
          actions={
            <Link to="/hotel-reviews">
              <Button variant="secondary" size="sm">← Back</Button>
            </Link>
          }
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching review…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${review.reviewer_name}`}
        subtitle={`Review ID ${review.id} · Hotel #${review.hotel_id}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/hotel-reviews">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        <HotelReviewForm
          defaultValues={reviewToFormValues(review)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this review</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently removes this review from the hotel.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete review by "${review.reviewer_name}"? This cannot be undone.`)) return;
                try {
                  await hotelReviewsService.delete(reviewId);
                  navigate('/hotel-reviews', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
