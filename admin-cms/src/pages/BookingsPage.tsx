import { useEffect, useRef, useState } from 'react';
import { ClipboardList, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { BookingStatusBadge, Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/utils';
import { bookingsService, type BookingListParams } from '@/services/bookings.service';
import { getErrorMessage } from '@/lib/api';
import type { Booking, BookingType, BookingStatus } from '@/types';

const PAGE_SIZE = 25;

function RowActions({ booking }: { booking: Booking }) {
  return (
    <div className="flex items-center justify-end">
      <Link to={`/bookings/${booking.id}`}>
        <Button variant="ghost" size="sm">
          <Eye size={13} />
        </Button>
      </Link>
    </div>
  );
}

const columns: Column<Booking>[] = [
  {
    key: 'booking_code',
    header: 'Code',
    width: '120px',
    render: (row) => (
      <Link
        to={`/bookings/${row.id}`}
        className="font-medium text-blue-600 hover:underline"
      >
        <code className="text-xs">{row.booking_code}</code>
      </Link>
    ),
  },
  {
    key: 'booking_type',
    header: 'Type',
    width: '80px',
    render: (row) => (
      <Badge variant={row.booking_type === 'hotel' ? 'info' : 'neutral'}>
        {row.booking_type}
      </Badge>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: '90px',
    render: (row) => <BookingStatusBadge status={row.status} />,
  },
  {
    key: 'guest_info_label',
    header: 'Guest',
    render: (row) => (
      <span className="text-sm text-slate-600">
        {row.guest_info_label ?? '—'}
      </span>
    ),
  },
  {
    key: 'title',
    header: 'Booking Details',
    render: (row) => (
      <div className="min-w-0">
        <div className="font-medium text-sm text-slate-900 truncate">
          {row.title}
        </div>
        {row.subtitle && (
          <div className="text-xs text-slate-500 truncate mt-0.5">
            {row.subtitle}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'start_date',
    header: 'Dates',
    width: '140px',
    render: (row) => (
      <div className="text-xs text-slate-600">
        {row.start_date && (
          <div>{formatDate(row.start_date)}</div>
        )}
        {row.end_date && row.end_date !== row.start_date && (
          <div className="text-slate-400">to {formatDate(row.end_date)}</div>
        )}
        {row.nights_or_usage_label && (
          <div className="text-slate-400 mt-0.5">
            {row.nights_or_usage_label}
          </div>
        )}
      </div>
    ),
  },
  {
    key: 'total_amount',
    header: 'Amount',
    align: 'right',
    width: '100px',
    render: (row) => (
      <div className="text-sm font-mono">
        {formatCurrency(row.total_amount, row.currency)}
      </div>
    ),
  },
  {
    key: 'confirmation_sent',
    header: 'Sent',
    align: 'center',
    width: '60px',
    render: (row) => (
      <span className="text-xs">
        {row.confirmation_sent ? '✓' : '—'}
      </span>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    width: '100px',
    render: (row) => (
      <div className="text-xs text-slate-500">
        {formatDate(row.created_at)}
      </div>
    ),
  },
  {
    key: 'id' as keyof Booking,
    header: '',
    width: '50px',
    render: (row) => <RowActions booking={row} />,
  },
];

export function BookingsPage() {
  const [items, setItems] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [bookingType, setBookingType] = useState<BookingType | ''>('');
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'start_date' | 'total_amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, bookingType, status, sortBy, sortOrder]);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadWith({ search: value, page: 1 });
    }, 300);
  }

  async function load() {
    loadWith({
      search,
      booking_type: bookingType || undefined,
      status: status || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
    });
  }

  async function loadWith(params: BookingListParams) {
    setLoading(true);
    setError('');
    try {
      const res = await bookingsService.list({
        ...params,
        limit: PAGE_SIZE,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="View and manage hotel and transport booking statuses"
      />

      {/* Filters */}
      <div className="mt-4 mb-4 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={bookingType}
          onChange={(e) => {
            setBookingType(e.target.value as BookingType | '');
            setPage(1);
          }}
          className="w-32"
        >
          <option value="">All types</option>
          <option value="hotel">Hotel</option>
          <option value="transport">Transport</option>
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as BookingStatus | '');
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
            setSortBy(by);
            setSortOrder(order);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="created_at-desc">Newest first</option>
          <option value="created_at-asc">Oldest first</option>
          <option value="start_date-desc">Start date ↓</option>
          <option value="start_date-asc">Start date ↑</option>
          <option value="total_amount-desc">Amount ↓</option>
          <option value="total_amount-asc">Amount ↑</option>
        </Select>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={ClipboardList}
          title="No bookings found"
          description="Try adjusting your filters or check back later for new bookings."
        />
      ) : (
        <Table
          columns={columns}
          data={items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No bookings found."
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{total} total ({bookingType || 'all types'}, {status || 'all statuses'})</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="px-2">Page {page} of {totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
