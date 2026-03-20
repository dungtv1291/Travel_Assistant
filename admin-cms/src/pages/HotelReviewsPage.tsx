import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { hotelReviewsService } from '@/services/hotel-reviews.service';
import { hotelsService } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';
import { formatDate } from '@/utils';
import type { Hotel, HotelReview } from '@/types';

const PAGE_SIZE = 25;

function RowActions({ review }: { review: HotelReview }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete review by "${review.reviewer_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await hotelReviewsService.delete(review.id);
      window.location.reload();
    } catch (err) {
      alert(getErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/hotel-reviews/${review.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

const columns: Column<HotelReview>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
  },
  {
    key: 'reviewer_name',
    header: 'Reviewer',
    render: (r) => (
      <Link to={`/hotel-reviews/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {r.reviewer_name}
      </Link>
    ),
  },
  {
    key: 'rating',
    header: 'Rating',
    align: 'center',
    width: '80px',
    render: (r) => <span className="text-amber-500 font-semibold text-xs">★ {r.rating}</span>,
  },
  {
    key: 'review_date',
    header: 'Date',
    render: (r) => r.review_date ? (
      <span className="text-xs text-slate-600">{formatDate(r.review_date)}</span>
    ) : (
      <span className="text-slate-300">—</span>
    ),
  },
  {
    key: 'content_en',
    header: 'Content (EN)',
    render: (r) => (
      <span className="text-xs text-slate-600 line-clamp-1 max-w-xs">{r.content_en ?? '—'}</span>
    ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (r) => <ActiveBadge active={r.is_active} />,
  },
  {
    key: 'actions',
    header: '',
    width: '80px',
    align: 'right',
    render: (r) => <RowActions review={r} />,
  },
];

export function HotelReviewsPage() {
  const [items, setItems] = useState<HotelReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hotelsService
      .list({ limit: 200 })
      .then((r) => setHotels(r.items))
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search, hotelId);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, hotelId]);

  useEffect(() => {
    fetchData(page, search, hotelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchData(p: number, q: string, hid: string) {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page: p, limit: PAGE_SIZE };
      if (q) params.search = q;
      if (hid) params.hotel_id = parseInt(hid);
      const result = await hotelReviewsService.list(params);
      setItems(result.items);
      setTotal(result.total);
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
        title="Hotel Reviews"
        subtitle={`${total} review${total !== 1 ? 's' : ''} total`}
        actions={
          <Link to="/hotel-reviews/new">
            <Button size="sm">+ New review</Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by reviewer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 w-52"
          />
        </div>
        <Select
          value={hotelId}
          onChange={(e) => { setHotelId(e.target.value); setPage(1); }}
          className="w-52"
        >
          <option value="">All hotels</option>
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && items.length === 0 && !error ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description={search || hotelId ? 'No results match your filters.' : 'Create your first review to get started.'}
          action={
            !search && !hotelId ? (
              <Link to="/hotel-reviews/new"><Button size="sm">+ New review</Button></Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table columns={columns} data={items} rowKey={(r) => r.id} loading={loading} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{total} total</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={14} />
                </Button>
                <span>Page {page} of {totalPages}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
