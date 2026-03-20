import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, ChevronLeft, ChevronRight, Pencil, Trash2, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { hotelsService } from '@/services/hotels.service';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination, Hotel } from '@/types';

const PAGE_SIZE = 25;

const columns: Column<Hotel>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
  },
  {
    key: 'name',
    header: 'Name',
    render: (r) => (
      <Link to={`/hotels/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {r.name}
      </Link>
    ),
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (r) => <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{r.slug}</code>,
  },
  {
    key: 'star_rating',
    header: 'Stars',
    align: 'center',
    width: '70px',
    render: (r) =>
      r.star_rating ? (
        <span className="text-amber-500 text-xs font-semibold tracking-tight">
          {'★'.repeat(r.star_rating)}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: 'rating',
    header: 'Rating',
    align: 'center',
    width: '70px',
    render: (r) =>
      r.rating ? (
        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-700">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          {r.rating}
        </span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: 'nightly_from_price',
    header: 'From price',
    render: (r) =>
      r.nightly_from_price
        ? `${r.currency ?? ''} ${r.nightly_from_price}`.trim()
        : <span className="text-slate-300">—</span>,
  },
  {
    key: 'is_recommended',
    header: 'Rec.',
    align: 'center',
    width: '52px',
    render: (r) =>
      r.is_recommended ? (
        <span className="text-xs font-bold text-amber-500">★</span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (r) => <ActiveBadge active={r.is_active} />,
  },
  {
    key: 'sort_order',
    header: 'Sort',
    align: 'right',
    width: '52px',
    render: (r) => <span className="text-slate-400 text-xs">{r.sort_order}</span>,
  },
];

function RowActions({
  hotel,
  onDeleted,
}: {
  hotel: Hotel;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete hotel "${hotel.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await hotelsService.delete(hotel.id);
      onDeleted();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link to={`/hotels/${hotel.id}/edit`}>
        <Button variant="ghost" size="sm">
          <Pencil size={13} />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

const columnsWithActions = (onDeleted: (h: Hotel) => void): Column<Hotel>[] => [
  ...columns,
  {
    key: 'id' as keyof Hotel,
    header: '',
    width: '80px',
    render: (r) => <RowActions hotel={r} onDeleted={() => onDeleted(r)} />,
  },
];

export function HotelsPage() {
  const [items, setItems] = useState<Hotel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load destinations for filter dropdown once
  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => setDestinations(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, destinationId]);

  // Debounce search
  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadWith({ search: value, destination_id: destinationId || undefined, page: 1 });
    }, 300);
  }

  function handleDestinationFilter(value: string) {
    setDestinationId(value);
    setPage(1);
  }

  async function load() {
    loadWith({ search, destination_id: destinationId || undefined, page });
  }

  async function loadWith(params: { search?: string; destination_id?: string | number; page?: number }) {
    setLoading(true);
    setError('');
    try {
      const res = await hotelsService.list({
        page: params.page ?? page,
        limit: PAGE_SIZE,
        search: params.search || undefined,
        destination_id: params.destination_id || undefined,
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
  const cols = columnsWithActions(() => load());

  return (
    <div>
      <PageHeader
        title="Hotels"
        subtitle="Manage hotel listings, room types, amenities and reviews"
        actions={
          <Link to="/hotels/new">
            <Button size="sm">+ New hotel</Button>
          </Link>
        }
      />

      {/* ── Toolbar ── */}
      <div className="mt-4 mb-3 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search hotels…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={destinationId}
          onChange={(e) => handleDestinationFilter(e.target.value)}
          className="w-52"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name_en}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={Building2}
          title="No hotels found"
          description={
            search || destinationId
              ? 'No hotels match your current filters.'
              : 'Add your first hotel to get started.'
          }
          action={
            !search && !destinationId ? (
              <Link to="/hotels/new">
                <Button size="sm">+ New hotel</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <Table
          columns={cols}
          data={items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No hotels found."
        />
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {total} result{total !== 1 ? 's' : ''} · page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
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


