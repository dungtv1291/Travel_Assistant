import { useEffect, useRef, useState } from 'react';
import { Clock, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { transportDurationOptionsService } from '@/services/transports.service';
import { transportsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportDurationOption, TransportService } from '@/types';

const PAGE_SIZE = 25;

function RowActions({ opt, onDeleted }: { opt: TransportDurationOption; onDeleted: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete duration option "${opt.label_en}"?`)) return;
    setDeleting(true);
    try {
      await transportDurationOptionsService.delete(opt.id);
      onDeleted();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link to={`/transport-duration-options/${opt.id}/edit`}>
        <Button variant="ghost" size="sm"><Pencil size={13} /></Button>
      </Link>
      <Button variant="ghost" size="sm" loading={deleting} onClick={handleDelete}>
        <Trash2 size={13} className="text-red-500" />
      </Button>
    </div>
  );
}

const baseColumns: Column<TransportDurationOption>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400 font-mono text-xs">#{r.id}</span>,
  },
  {
    key: 'transport_service_id',
    header: 'Service',
    render: (r) => <span className="text-slate-500">#{r.transport_service_id}</span>,
  },
  {
    key: 'label_en',
    header: 'Label (EN)',
    render: (r) => (
      <Link to={`/transport-duration-options/${r.id}/edit`} className="font-medium text-blue-600 hover:underline">
        {r.label_en}
      </Link>
    ),
  },
  {
    key: 'label_ko',
    header: 'Label (KO)',
    render: (r) => <span className="text-slate-500 text-xs">{r.label_ko}</span>,
  },
  {
    key: 'value',
    header: 'Days',
    align: 'center',
    width: '60px',
    render: (r) => r.value,
  },
  {
    key: 'price_amount',
    header: 'Price',
    align: 'right',
    render: (r) => `${r.currency} ${r.price_amount}`,
  },
  {
    key: 'sort_order',
    header: 'Sort',
    align: 'right',
    width: '52px',
    render: (r) => <span className="text-slate-400 text-xs">{r.sort_order}</span>,
  },
];

const columnsWithActions = (onDeleted: () => void): Column<TransportDurationOption>[] => [
  ...baseColumns,
  {
    key: 'id' as keyof TransportDurationOption,
    header: '',
    width: '80px',
    render: (r) => <RowActions opt={r} onDeleted={onDeleted} />,
  },
];

export function TransportDurationOptionsPage() {
  const [items, setItems] = useState<TransportDurationOption[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [transportId, setTransportId] = useState('');
  const [transports, setTransports] = useState<TransportService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    transportsService
      .list({ limit: 200 })
      .then((res) => setTransports(res.items))
      .catch(() => {/* non-fatal */});
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, transportId]);

  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      loadWith({ search: value, transport_service_id: transportId || undefined, page: 1 });
    }, 300);
  }

  async function load() {
    loadWith({ search, transport_service_id: transportId || undefined, page });
  }

  async function loadWith(params: { search?: string; transport_service_id?: string | number; page?: number }) {
    setLoading(true);
    setError('');
    try {
      const res = await transportDurationOptionsService.list({
        page: params.page ?? page,
        limit: PAGE_SIZE,
        search: params.search || undefined,
        transport_service_id: params.transport_service_id || undefined,
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
        title="Duration Options"
        subtitle="Manage pricing and duration choices for transport services"
        actions={
          <Link to="/transport-duration-options/new">
            <Button size="sm">+ New option</Button>
          </Link>
        }
      />

      <div className="mt-4 mb-3 flex flex-wrap items-end gap-3">
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search options…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={transportId}
          onChange={(e) => { setTransportId(e.target.value); setPage(1); }}
          className="w-56"
        >
          <option value="">All services</option>
          {transports.map((t) => (
            <option key={t.id} value={String(t.id)}>{t.name_en}</option>
          ))}
        </Select>
      </div>

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {items.length === 0 && !loading ? (
        <EmptyState
          icon={Clock}
          title="No duration options found"
          description={search || transportId ? 'No options match your filters.' : 'Add your first duration option.'}
          action={
            !search && !transportId ? (
              <Link to="/transport-duration-options/new">
                <Button size="sm">+ New option</Button>
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
          emptyMessage="No duration options found."
        />
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
