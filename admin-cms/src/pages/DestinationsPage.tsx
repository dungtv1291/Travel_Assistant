import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map, Search, ChevronLeft, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination } from '@/types';

const PAGE_SIZE = 25;

const columns: Column<Destination>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (row) => <span className="text-slate-400 font-mono text-xs">#{row.id}</span>,
  },
  {
    key: 'name_en',
    header: 'Name (EN)',
    render: (row) => (
      <Link
        to={`/destinations/${row.id}/edit`}
        className="font-medium text-blue-600 hover:underline"
      >
        {row.name_en}
      </Link>
    ),
  },
  {
    key: 'name_ko',
    header: 'Name (KO)',
    render: (row) => <span className="text-slate-600">{row.name_ko}</span>,
  },
  {
    key: 'slug',
    header: 'Slug',
    render: (row) => <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{row.slug}</code>,
  },
  {
    key: 'region_label_en',
    header: 'Region',
    render: (row) => row.region_label_en ?? <span className="text-slate-300">—</span>,
  },
  {
    key: 'rating',
    header: 'Rating',
    align: 'center',
    render: (row) =>
      row.rating ? (
        <span className="text-amber-600 font-medium text-xs">{row.rating} ★</span>
      ) : (
        <span className="text-slate-300">—</span>
      ),
  },
  {
    key: 'is_featured',
    header: 'Featured',
    align: 'center',
    render: (row) =>
      row.is_featured ? (
        <span className="text-amber-500 font-bold text-base leading-none">★</span>
      ) : (
        <span className="text-slate-200">★</span>
      ),
  },
  {
    key: 'is_active',
    header: 'Status',
    render: (row) => <ActiveBadge active={row.is_active} />,
  },
  {
    key: 'sort_order',
    header: 'Sort',
    align: 'right',
    render: (row) => <span className="text-slate-500 text-xs">{row.sort_order}</span>,
  },
  {
    key: 'actions',
    header: '',
    width: '80px',
    align: 'right',
    render: (row) => <RowActions destination={row} />,
  },
];

function RowActions({ destination }: { destination: Destination }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${destination.name_en}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await destinationsService.delete(destination.id);
      // The parent will re-fetch on next interaction; trigger a reload
      window.location.reload();
    } catch (err) {
      alert(getErrorMessage(err));
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/destinations/${destination.id}/edit`}>
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

export function DestinationsPage() {
  const [items, setItems] = useState<Destination[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchData(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchData(p: number, q: string) {
    setLoading(true);
    setError('');
    try {
      const result = await destinationsService.list({ page: p, limit: PAGE_SIZE, search: q });
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
        title="Destinations"
        subtitle={`${total} destination${total !== 1 ? 's' : ''} total`}
        actions={
          <Link to="/destinations/new">
            <Button size="sm">+ New destination</Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && items.length === 0 && !error ? (
        <EmptyState
          icon={Map}
          title="No destinations yet"
          description={search ? `No results for "${search}".` : 'Create your first destination to get started.'}
          action={
            !search ? (
              <Link to="/destinations/new">
                <Button size="sm">+ New destination</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={items}
            rowKey={(r) => r.id}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={14} />
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
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
