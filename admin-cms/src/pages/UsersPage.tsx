import { Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { ActiveBadge } from '@/components/ui/Badge';
import { formatDate, initials } from '@/utils';
import type { User } from '@/types';

const columns: Column<User>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (row) => <span className="text-slate-400">#{row.id}</span>,
  },
  {
    key: 'full_name',
    header: 'Name',
    render: (row) => (
      <div className="flex items-center gap-2">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
          {initials(row.full_name)}
        </span>
        <span className="font-medium text-slate-800">{row.full_name ?? '—'}</span>
      </div>
    ),
  },
  { key: 'email', header: 'Email' },
  { key: 'language', header: 'Language', render: (row) => row.language?.toUpperCase() ?? '—' },
  {
    key: 'is_active',
    header: 'Status',
    render: (row) => <ActiveBadge active={row.is_active} />,
  },
  {
    key: 'created_at',
    header: 'Joined',
    render: (row) => formatDate(row.created_at),
  },
];

export function UsersPage() {
  const data: User[] = [];
  const loading = false;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="View registered users and toggle account status"
      />

      {data.length === 0 && !loading ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="User list will be loaded from GET /users in Phase 4."
        />
      ) : (
        <Table
          columns={columns}
          data={data}
          rowKey={(r) => r.id}
          loading={loading}
        />
      )}

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-4 text-xs text-slate-400">
        <p className="font-medium text-slate-500 mb-1">Read-only + toggle (Phase 4)</p>
        <p>
          Toggle <code>is_active</code> via PATCH /users/:id · No user creation from CMS
          · View user preferences inline
        </p>
      </div>
    </div>
  );
}
