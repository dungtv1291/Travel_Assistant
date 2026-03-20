import { Heart } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils';
import type { Favorite } from '@/types';

const columns: Column<Favorite>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '56px',
    render: (r) => <span className="text-slate-400">#{r.id}</span>,
  },
  {
    key: 'user_id',
    header: 'User',
    render: (r) => <span className="text-slate-500">#{r.user_id}</span>,
  },
  {
    key: 'target_type',
    header: 'Type',
    render: (r) => <Badge variant="neutral">{r.target_type}</Badge>,
  },
  {
    key: 'target_id',
    header: 'Target ID',
    render: (r) => <span className="text-slate-500">#{r.target_id}</span>,
  },
  {
    key: 'created_at',
    header: 'Saved at',
    render: (r) => formatDate(r.created_at),
  },
];

export function FavoritesPage() {
  const data: Favorite[] = [];
  const loading = false;

  return (
    <div>
      <PageHeader
        title="Favorites"
        subtitle="User-saved favorites across destinations, hotels and places (read-only)"
      />

      {data.length === 0 && !loading ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="User favorites will appear here once the API is connected."
        />
      ) : (
        <Table
          columns={columns}
          data={data}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No favorites found."
        />
      )}
    </div>
  );
}
