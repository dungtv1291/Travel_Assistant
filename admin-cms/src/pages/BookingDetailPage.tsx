import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { BookingStatusBadge, Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency, formatDateTime } from '@/utils';
import { bookingsService, confirmBooking, cancelBooking } from '@/services/bookings.service';
import { getErrorMessage } from '@/lib/api';
import type { Booking } from '@/types';

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const bookingId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!bookingId) return;
    bookingsService
      .get(bookingId)
      .then(setBooking)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [bookingId]);

  async function handleStatusAction(action: 'confirm' | 'cancel') {
    if (!booking) return;
    setActionLoading(action);
    try {
      const updated = action === 'confirm' 
        ? await confirmBooking(booking.id)
        : await cancelBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setActionLoading('');
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader
          title="Booking Detail"
          actions={<Link to="/bookings"><Button variant="secondary" size="sm">← Back</Button></Link>}
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching booking details…</div>
      </div>
    );
  }

  const canConfirm = booking.status === 'pending';
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.booking_code}`}
        subtitle={`${booking.booking_type} booking · ${booking.status}`}
        actions={
          <div className="flex items-center gap-2">
            {canConfirm && (
              <Button
                size="sm"
                loading={actionLoading === 'confirm'}
                onClick={() => handleStatusAction('confirm')}
              >
                Confirm
              </Button>
            )}
            {canCancel && (
              <Button
                variant="danger"
                size="sm"
                loading={actionLoading === 'cancel'}
                onClick={() => handleStatusAction('cancel')}
              >
                Cancel
              </Button>
            )}
            <Link to="/bookings">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</dt>
                <dd className="mt-1">
                  <Badge variant={booking.booking_type === 'hotel' ? 'info' : 'neutral'}>
                    {booking.booking_type}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</dt>
                <dd className="mt-1">
                  <BookingStatusBadge status={booking.status} />
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Title</dt>
                <dd className="mt-1 font-medium text-slate-900">{booking.title}</dd>
                {booking.subtitle && (
                  <dd className="text-sm text-slate-600">{booking.subtitle}</dd>
                )}
              </div>
              {booking.guest_info_label && (
                <div className="col-span-2">
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Guest Info</dt>
                  <dd className="mt-1 text-slate-900">{booking.guest_info_label}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Dates & Duration */}
          {(booking.start_date || booking.end_date || booking.nights_or_usage_label) && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Schedule</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {booking.start_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Start Date</dt>
                    <dd className="mt-1 text-slate-900">{formatDate(booking.start_date)}</dd>
                  </div>
                )}
                {booking.end_date && (
                  <div>
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">End Date</dt>
                    <dd className="mt-1 text-slate-900">{formatDate(booking.end_date)}</dd>
                  </div>
                )}
                {booking.nights_or_usage_label && (
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Duration</dt>
                    <dd className="mt-1 text-slate-900">{booking.nights_or_usage_label}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.note && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notes</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{booking.note}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount</span>
                <span className="font-mono">
                  {formatCurrency(booking.total_amount, booking.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Currency</span>
                <span>{booking.currency ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Communication */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Communication</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Confirmation sent</span>
                <span className="text-sm">
                  {booking.confirmation_sent ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="neutral">No</Badge>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">System Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Booking ID</dt>
                <dd className="mt-1 font-mono text-slate-900">#{booking.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</dt>
                <dd className="mt-1 font-mono text-slate-900">
                  {booking.user_id ? `#${booking.user_id}` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Created</dt>
                <dd className="mt-1 text-slate-900">{formatDateTime(booking.created_at)}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
