import { useEffect, useRef, useState } from 'react';
import { Car, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge, Badge } from '@/components/ui/Badge';
import { transportsService } from '@/services/transports.service';
import { destinationsService } from '@/services/destinations.service';
import { getErrorMessage } from '@/lib/api';
import type { Destination, TransportService } from '@/types';

const PAGE_SIZE = 25;

const SERVICE_TYPE_LABELS: Record<string, string> = {
  airport_pickup: 'Airport pickup',
  private_car: 'Private car',
  self_drive: 'Self drive',
  scooter: 'Scooter',
  day_trip: 'Day trip',
};

const SERVICE_TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS);

function RowActions({
  transport,
  onDeleted,
}: {
  transport: TransportService;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${transport.name_en}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await transportsService.delete(transport.id);
      onDeleted();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link to={`/transports/${transport.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

const baseColumns: Column<TransportService>[] = [
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
      <Link to={`/transports/${row.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {row.name_en}
      </Link>
    ),
  },
  {
    key: 'service_type',
    header: 'Type',
    render: (row) => (
      <Badge variant="neutral">{SERVICE_TYPE_LABELS[row.service_type] ?? row.service_type}</Badge>
    ),
  },
  {
    key: 'vehicle_model',
    header: 'Vehicle',
    render: (row) => row.vehicle_model ?? <span className="text-slate-300">—</span>,
  },
  {
    key: 'capacity',
    header: 'Cap.',
    align: 'center',
    width: '60px',
    render: (row) => row.capacity ?? <span className="text-slate-300">—</span>,
  },
  {
    key: 'is_popular',
    header: 'Pop.',
    align: 'center',
    width: '52px',
    render: (row) =>
      row.is_popular ? (
        <span className="text-amber-500 font-bold text-xs">★</span>
      ) : (
        <span className="text-slate-300">—</span>
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
    width: '52px',
    render: (row) => <span className="text-slate-400 text-xs">{row.sort_order}</span>,
  },
];

const columnsWithActions = (onDeleted: (t: TransportService) => void): Column<TransportService>[] => [
  ...baseColumns,
  {
    key: 'id' as keyof TransportService,
    header: '',
    width: '80px',
    render: (r) => <RowActions transport={r} onDeleted={() => onDeleted(r)} />,
  },
];

export function TransportsPage() {
  const [items, setItems] = useState<TransportService[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    destinationsService
      .list({ limit: 200 })
      .then((res) => setDestinations(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, destinationId, serviceType]);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadWith({ search: value, destination_id: destinationId || undefined, service_type: serviceType || undefined, page: 1 });
    }, 300);
  }

  function handleDestinationFilter(value: string) {
    setDestinationId(value);
    setPage(1);
  }

  function handleTypeFilter(value: string) {
    setServiceType(value);
    setPage(1);
  }

  async function load() {
    loadWith({ search, destination_id: destinationId || undefined, service_type: serviceType || undefined, page });
  }

  async function loadWith(params: {
    search?: string;
    destination_id?: string | number;
    service_type?: string;
    page?: number;
  }) {
    setLoading(true);
    setError('');
    try {
      const res = await transportsService.list({
        page: params.page ?? page,
        limit: PAGE_SIZE,
        search: params.search || undefined,
        destination_id: params.destination_id || undefined,
        service_type: params.service_type || undefined,
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
        title="Transport Services"
        subtitle="Manage transport service listings, duration options and pickup points"
        actions={
          <Link to="/transports/new">
            <Button size="sm">+ New service</Button>
          </Link>
        }
      />

      {/* ── Toolbar ── */}
      <div className="mt-4 mb-3 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search services…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={destinationId}
          onChange={(e) => handleDestinationFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={String(d.id)}>{d.name_en}</option>
          ))}
        </Select>
        <Select
          value={serviceType}
          onChange={(e) => handleTypeFilter(e.target.value)}
          className="w-44"
        >
          <option value="">All types</option>
          {SERVICE_TYPE_OPTIONS.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
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
          icon={Car}
          title="No transport services found"
          description={
            search || destinationId || serviceType
              ? 'No services match your current filters.'
              : 'Add your first transport service to get started.'
          }
          action={
            !search && !destinationId && !serviceType ? (
              <Link to="/transports/new">
                <Button size="sm">+ New service</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table
            columns={cols}
            data={items}
            rowKey={(r) => r.id}
            loading={loading}
            emptyMessage="No transport services found."
          />
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
                  <ChevronLeft size={14} /> Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
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
