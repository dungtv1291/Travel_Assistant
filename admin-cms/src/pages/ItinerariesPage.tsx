import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalendarDays, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

import { formatDate, formatCurrency } from '@/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { itinerariesService, type ItineraryListParams } from '@/services/itineraries.service';
import { destinationsService } from '@/services/destinations.service';
import type { Itinerary, PaginatedResponse, Destination } from '@/types';

const PAGE_SIZE = 25;

const columns: Column<Itinerary>[] = [
  {
    key: 'public_id',
    header: 'Public ID',
    width: '120px',
    render: (r) => (
      <Link 
        to={`/itineraries/${r.id}`} 
        className="font-mono text-xs text-blue-600 hover:underline"
      >
        {r.public_id}
      </Link>
    ),
  },
  {
    key: 'title',
    header: 'Title',
    render: (r) => (
      <div className="min-w-0">
        <Link 
          to={`/itineraries/${r.id}`} 
          className="font-medium text-blue-600 hover:underline block truncate"
          title={r.title}
        >
          {r.title}
        </Link>
        <div className="text-xs text-slate-500">User #{r.user_id}</div>
      </div>
    ),
  },
  {
    key: 'destination_id',
    header: 'Destination',
    width: '120px',
    render: (r) => <span className="text-slate-500">#{r.destination_id}</span>,
  },
  {
    key: 'duration',
    header: 'Duration',
    width: '100px',
    align: 'center',
    render: (r) => (
      <div className="text-center">
        <div className="font-medium">{r.nights}N/{r.days}D</div>
      </div>
    ),
  },
  {
    key: 'traveler_type',
    header: 'Traveler',
    width: '100px',
    render: (r) => <Badge variant="neutral">{r.traveler_type}</Badge>,
  },
  {
    key: 'budget_level',
    header: 'Budget',
    width: '90px',
    render: (r) => <Badge variant="neutral">{r.budget_level}</Badge>,
  },
  {
    key: 'pace',
    header: 'Pace',
    width: '80px',
    render: (r) => <Badge variant="neutral">{r.pace}</Badge>,
  },
  {
    key: 'language',
    header: 'Lang',
    width: '60px',
    align: 'center',
    render: (r) => <span className="text-slate-600 uppercase">{r.language}</span>,
  },
  {
    key: 'currency',
    header: 'Currency',
    width: '80px',
    align: 'center',
    render: (r) => <span className="text-slate-600 font-mono">{r.currency}</span>,
  },
  {
    key: 'total_activities',
    header: 'Activities',
    width: '90px',
    align: 'center',
    render: (r) => <span className="font-medium">{r.total_activities}</span>,
  },
  {
    key: 'estimated_cost_amount',
    header: 'Est. Cost',
    width: '120px',
    align: 'right',
    render: (r) => (
      <div className="text-right">
        <div className="font-medium">
          {formatCurrency(r.estimated_cost_amount, r.estimated_cost_currency)}
        </div>
      </div>
    ),
  },
  {
    key: 'is_saved',
    header: 'Saved',
    width: '60px',
    align: 'center',
    render: (r) => (
      <span className={r.is_saved ? 'text-yellow-500' : 'text-slate-300'}>
        {r.is_saved ? '★' : '☆'}
      </span>
    ),
  },
  {
    key: 'created_at',
    header: 'Created',
    width: '120px',
    render: (r) => <span className="text-sm text-slate-600">{formatDate(r.created_at)}</span>,
  },
];

export function ItinerariesPage() {
  const [data, setData] = useState<PaginatedResponse<Itinerary>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [destinationFilter, setDestinationFilter] = useState<string>('');
  const [savedFilter, setSavedFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Load destinations for filter dropdown
  useEffect(() => {
    async function loadDestinations() {
      try {
        const result = await destinationsService.list({ limit: 1000 });
        setDestinations(result.items);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    }
    loadDestinations();
  }, []);

  // Build filter params
  const filterParams = useMemo((): ItineraryListParams => {
    const params: ItineraryListParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sort_by: sortBy as ItineraryListParams['sort_by'],
      sort_order: sortOrder,
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (destinationFilter) params.destination_id = parseInt(destinationFilter);
    if (savedFilter) params.is_saved = savedFilter === 'true';
    if (userIdFilter) params.user_id = parseInt(userIdFilter);

    return params;
  }, [currentPage, debouncedSearch, destinationFilter, savedFilter, userIdFilter, sortBy, sortOrder]);

  // Load itineraries
  const loadItineraries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await itinerariesService.list(filterParams);
      setData(result);
    } catch (err) {
      console.error('Failed to load itineraries:', err);
      setError('Failed to load itineraries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, destinationFilter, savedFilter, userIdFilter, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm('');
    setDestinationFilter('');
    setSavedFilter('');
    setUserIdFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || destinationFilter || savedFilter || userIdFilter || sortBy !== 'created_at' || sortOrder !== 'desc';

  return (
    <div>
      <PageHeader
        title="Itineraries"
        subtitle="Monitor AI-generated travel plans and user-saved itineraries"
      />

      {/* Filters */}
      <div className="p-4 mb-6 border rounded-lg bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search titles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Destination Filter */}
          <div>
            <Select
              value={destinationFilter}
              onValueChange={setDestinationFilter}
            >
              <option value="">All destinations</option>
              {destinations.map((dest) => (
                <option key={dest.id} value={dest.id.toString()}>
                  {dest.name_en || dest.name_ko}
                </option>
              ))}
            </Select>
          </div>

          {/* Saved Filter */}
          <div>
            <Select
              value={savedFilter}
              onValueChange={setSavedFilter}
            >
              <option value="">All saved status</option>
              <option value="true">Saved only</option>
              <option value="false">Not saved</option>
            </Select>
          </div>

          {/* User ID Filter */}
          <div>
            <Input
              placeholder="User ID"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              type="number"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <span className="text-sm text-slate-600">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <option value="created_at">Created date</option>
            <option value="start_date">Start date</option>
            <option value="nights">Duration</option>
            <option value="estimated_cost_amount">Cost</option>
            <option value="title">Title</option>
          </Select>
          <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
          
          {/* Results summary */}
          <div className="ml-auto text-sm text-slate-500">
            {loading ? 'Loading...' : `${data.total} total results`}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={loadItineraries}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results */}
      {data.items.length === 0 && !loading ? (
        <EmptyState
          icon={CalendarDays}
          title={hasActiveFilters ? "No matching itineraries" : "No itineraries yet"}
          description={
            hasActiveFilters 
              ? "Try adjusting your filters to see more results."
              : "AI-generated itineraries will appear here once users start creating travel plans."
          }
        />
      ) : (
        <Table
          columns={columns}
          data={data.items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No itineraries found."

        />
      )}
    </div>
  );
}
