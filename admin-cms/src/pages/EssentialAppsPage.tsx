import { useEffect, useRef, useState } from 'react';
import { AppWindow, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { essentialAppsService } from '@/services/essential-apps.service';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination, DestinationEssentialApp } from '@/types';

const PAGE_SIZE = 25;

function RowActions({ app, onDeleted }: { app: DestinationEssentialApp; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${app.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await essentialAppsService.delete(app.id);
      onDeleted();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/essential-apps/${app.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

function makeColumns(
  destMap: Record<number, string>,
  onDeleted: () => void,
): Column<DestinationEssentialApp>[] {
  return [
    {
      key: 'id',
      header: 'ID',
      width: '56px',
      render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
    },
    {
      key: 'destination_id',
      header: 'Destination',
      render: (r) => (
        <span className="text-slate-600 text-sm">
          {destMap[r.destination_id] ?? `#${r.destination_id}`}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'App Name',
      render: (r) => (
        <Link
          to={`/essential-apps/${r.id}/edit`}
          className="font-medium text-blue-600 hover:underline text-sm"
        >
          {r.name}
        </Link>
      ),
    },
    {
      key: 'subtitle',
      header: 'Subtitle',
      render: (r) => <span className="text-slate-500 text-sm">{r.subtitle ?? '—'}</span>,
    },
    {
      key: 'sort_order',
      header: 'Sort',
      align: 'right',
      width: '52px',
      render: (r) => <span className="text-slate-400 text-xs">{r.sort_order}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '80px',
      render: (r) => <ActiveBadge active={r.is_active} />,
    },
    {
      key: 'id' as keyof DestinationEssentialApp,
      header: '',
      width: '80px',
      render: (r) => <RowActions app={r} onDeleted={onDeleted} />,
    },
  ];
}

export function EssentialAppsPage() {
  const [items, setItems] = useState<DestinationEssentialApp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destMap, setDestMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => {
        setDestinations(res.items);
        const map: Record<number, string> = {};
        res.items.forEach((d) => { map[d.id] = d.name_en; });
        setDestMap(map);
      })
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, destinationId]);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadWith({ search: value, destination_id: destinationId || undefined, page: 1 });
    }, 300);
  }

  async function load() {
    loadWith({ search, destination_id: destinationId || undefined, page });
  }

  async function loadWith(params: {
    search?: string;
    destination_id?: string | number;
    page?: number;
  }) {
    setLoading(true);
    setError('');
    try {
      const res = await essentialAppsService.list({
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
  const cols = makeColumns(destMap, () => load());

  return (
    <div>
      <PageHeader
        title="Essential Apps"
        subtitle="Manage useful apps shown in the Essential Apps tab for each destination"
        actions={
          <Link to="/essential-apps/new">
            <Button size="sm">+ New app</Button>
          </Link>
        }
      />

      <div className="mt-4 mb-3 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search apps…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={destinationId}
          onChange={(e) => { setDestinationId(e.target.value); setPage(1); }}
          className="w-56"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={String(d.id)}>{d.name_en}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={AppWindow}
          title="No apps found"
          description="Add the first essential app for a destination."
          action={
            <Link to="/essential-apps/new">
              <Button size="sm">+ New app</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={cols}
          data={items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No apps found."
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>{total} total</span>
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
