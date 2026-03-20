import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { placesService } from '@/services/places.service';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination, Place } from '@/types';

const PAGE_SIZE = 25;

const columns: Column<Place>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
  },
  {
    key: 'name_en',
    header: 'Name (EN)',
    render: (r) => (
      <Link to={`/places/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {r.name_en}
      </Link>
    ),
  },
  {
    key: 'name_ko',
    header: 'Name (KO)',
    render: (r) => <span className="text-slate-600 text-xs">{r.name_ko}</span>,
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (r) => <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{r.slug}</code>,
  },
  {
    key: 'category_label_en',
    header: 'Category',
    render: (r) => r.category_label_en ?? <span className="text-slate-300">—</span>,
  },
  {
    key: 'rating',
    header: 'Rating',
    align: 'center',
    render: (r) =>
      r.rating ? (
        <span className="text-amber-600 font-medium text-xs">{r.rating} ★</span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: 'ticket_price_amount',
    header: 'Price',
    align: 'right',
    render: (r) =>
      r.ticket_price_amount ? (
        <span className="text-xs text-slate-600">
          {Number(r.ticket_price_amount).toLocaleString()} {r.ticket_price_currency ?? ''}
        </span>
      ) : (
        <span className="text-slate-300 text-xs">Free</span>
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
    render: (r) => <span className="text-slate-500 text-xs">{r.sort_order}</span>,
  },
  {
    key: 'actions',
    header: '',
    width: '80px',
    align: 'right',
    render: (r) => <RowActions place={r} />,
  },
];

function RowActions({ place }: { place: Place }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${place.name_en}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await placesService.delete(place.id);
      window.location.reload();
    } catch (err) {
      alert(getErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/places/${place.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

export function PlacesPage() {
  const [items, setItems] = useState<Place[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load destination list for the filter dropdown (all, no pagination needed for a select)
  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((r) => setDestinations(r.items))
      .catch(() => {/* non-fatal */});
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search, destinationId);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, destinationId]);

  useEffect(() => {
    fetchData(page, search, destinationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchData(p: number, q: string, destId: string) {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, unknown> = { page: p, limit: PAGE_SIZE };
      if (q) params.search = q;
      if (destId) params.destination_id = parseInt(destId);
      const result = await placesService.list(params);
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
        title="Places"
        subtitle={`${total} place${total !== 1 ? 's' : ''} total`}
        actions={
          <Link to="/places/new">
            <Button size="sm">+ New place</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7 w-56"
          />
        </div>
        <Select
          value={destinationId}
          onChange={(e) => { setDestinationId(e.target.value); setPage(1); }}
          className="w-52"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>{d.name_en}</option>
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
          icon={MapPin}
          title="No places yet"
          description={search || destinationId ? 'No results match your filters.' : 'Create your first place to get started.'}
          action={
            !search && !destinationId ? (
              <Link to="/places/new"><Button size="sm">+ New place</Button></Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table columns={columns} data={items} rowKey={(r) => r.id} loading={loading} />
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>Page {page} of {totalPages} ({total} total)</span>
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft size={14} /> Prev
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


