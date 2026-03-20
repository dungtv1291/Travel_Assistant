import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, truncate } from '@/utils';
import type { AiGenerationLog } from '@/types';

const columns: Column<AiGenerationLog>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (row) => <span className="text-slate-400">#{row.id}</span>,
  },
  {
    key: 'feature_type',
    header: 'Feature',
    render: (row) => <Badge variant="info">{row.feature_type}</Badge>,
  },
  { key: 'provider_name', header: 'Provider', render: (row) => row.provider_name ?? '—' },
  { key: 'user_id', header: 'User ID', render: (row) => row.user_id ? `#${row.user_id}` : 'anon' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Badge variant={row.status === 'success' ? 'success' : 'danger'}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'error_message',
    header: 'Error',
    render: (row) => row.error_message ? (
      <span className="text-xs text-red-600">{truncate(row.error_message, 60)}</span>
    ) : <span className="text-slate-300">—</span>,
  },
  {
    key: 'created_at',
    header: 'Time',
    render: (row) => formatDateTime(row.created_at),
  },
];

export function AiLogsPage() {
  const data: AiGenerationLog[] = [];
  const loading = false;

  return (
    <div>
      <PageHeader
        title="AI Generation Logs"
        subtitle="Read-only monitoring of AI feature usage, errors and provider calls"
      />

      {data.length === 0 && !loading ? (
        <EmptyState
          icon={Bot}
          title="No AI logs yet"
          description="Logs will be loaded from GET /admin/ai-logs once connected in Phase 4."
        />
      ) : (
        <Table
          columns={columns}
          data={data}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No AI logs found."
        />
      )}
    </div>
  );
}
