import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { hotelAmenitiesService } from '@/services/hotel-amenities.service';
import { hotelsService } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';
import type { Hotel, HotelAmenity } from '@/types';

const PAGE_SIZE = 25;

function RowActions({ amenity }: { amenity: HotelAmenity }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete amenity "${amenity.label_en}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await hotelAmenitiesService.delete(amenity.id);
      window.location.reload();
    } catch (err) {
      alert(getErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/hotel-amenities/${amenity.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

const columns: Column<HotelAmenity>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
  },
  {
    key: 'amenity_key',
    header: 'Key',
    render: (r) => <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{r.amenity_key}</code>,
  },
  {
    key: 'label_en',
    header: 'Label (EN)',
    render: (r) => (
      <Link to={`/hotel-amenities/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {r.label_en}
      </Link>
    ),
  },
  {
    key: 'label_ko',
    header: 'Label (KO)',
    render: (r) => <span className="text-slate-600 text-xs">{r.label_ko}</span>,
  },
  {
    key: 'icon_key',
    header: 'Icon',
    render: (r) => r.icon_key
      ? <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{r.icon_key}</code>
      : <span className="text-slate-300">—</span>,
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
    render: (r) => <RowActions amenity={r} />,
  },
];

export function HotelAmenitiesPage() {
  const [items, setItems] = useState<HotelAmenity[]>([]);
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
      const result = await hotelAmenitiesService.list(params);
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
        title="Hotel Amenities"
        subtitle={`${total} amenit${total !== 1 ? 'ies' : 'y'} total`}
        actions={
          <Link to="/hotel-amenities/new">
            <Button size="sm">+ New amenity</Button>
          </Link>
        }
      />

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by key or label…"
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
          icon={Wifi}
          title="No amenities yet"
          description={search || hotelId ? 'No results match your filters.' : 'Create your first amenity to get started.'}
          action={
            !search && !hotelId ? (
              <Link to="/hotel-amenities/new"><Button size="sm">+ New amenity</Button></Link>
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
