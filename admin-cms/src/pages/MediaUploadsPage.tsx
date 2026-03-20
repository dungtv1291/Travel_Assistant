import { useState, useEffect, useCallback, useMemo } from 'react';
import { Image, Search, Filter, Eye, Trash2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  mediaUploadsService, 
  deleteFile,
  formatFileSize, 
  getFileTypeColor, 
  isImageType,
  getCategoryLabel,
  MEDIA_CATEGORIES,
  type MediaUploadListParams 
} from '@/services/media-uploads.service';
import type { MediaUpload, PaginatedResponse } from '@/types';

const PAGE_SIZE = 25;

export function MediaUploadsPage() {
  const [data, setData] = useState<PaginatedResponse<MediaUpload>>({ items: [], total: 0, page: 1, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Build filter params
  const filterParams = useMemo((): MediaUploadListParams => {
    const params: MediaUploadListParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sort_by: sortBy as MediaUploadListParams['sort_by'],
      sort_order: sortOrder,
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (categoryFilter) params.category = categoryFilter as any;
    if (fileTypeFilter) params.file_type = fileTypeFilter;

    return params;
  }, [currentPage, debouncedSearch, categoryFilter, fileTypeFilter, sortBy, sortOrder]);

  // Load media uploads
  const loadUploads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await mediaUploadsService.list(filterParams);
      setData(result);
    } catch (err) {
      console.error('Failed to load uploads:', err);
      setError('Failed to load media uploads. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => {
    loadUploads();
  }, [loadUploads]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, categoryFilter, fileTypeFilter, sortBy, sortOrder]);

  // Handle file deletion
  const handleDelete = async (upload: MediaUpload) => {
    if (!confirm(`Are you sure you want to delete "${upload.file_name}"?`)) return;

    try {
      await deleteFile(upload.id);
      
      // Remove from local data
      setData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== upload.id),
        total: prev.total - 1
      }));
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError('Failed to delete file. Please try again.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setFileTypeFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || categoryFilter || fileTypeFilter || sortBy !== 'created_at' || sortOrder !== 'desc';

  const columns: Column<MediaUpload>[] = [
    {
      key: 'preview',
      header: '',
      width: '60px',
      render: (r) => (
        <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
          {isImageType(r.file_type) ? (
            <img 
              src={r.file_url} 
              alt={r.file_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <Image className="w-5 h-5 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      key: 'file_name',
      header: 'File Name',
      render: (r) => (
        <div className="min-w-0">
          <a 
            href={r.file_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-blue-600 hover:underline block truncate"
            title={r.file_name}
          >
            {r.file_name}
          </a>
          {r.description && (
            <div className="text-xs text-slate-500 truncate mt-1">{r.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category', 
      width: '120px',
      render: (r) => (
        <Badge variant="neutral" className="text-xs">
          {getCategoryLabel(r.category as any)}
        </Badge>
      ),
    },
    {
      key: 'file_type',
      header: 'Type',
      width: '100px',
      render: (r) => (
        <Badge variant={getFileTypeColor(r.file_type)} className="text-xs">
          {r.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
        </Badge>
      ),
    },
    {
      key: 'file_size',
      header: 'Size',
      width: '80px',
      align: 'right',
      render: (r) => <span className="text-sm font-mono">{formatFileSize(r.file_size)}</span>,
    },
    {
      key: 'uploaded_by',
      header: 'By',
      width: '80px', 
      render: (r) => (
        <span className="text-sm text-slate-600">
          {r.uploaded_by ? `#${r.uploaded_by}` : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Uploaded',
      width: '120px',
      render: (r) => <span className="text-sm text-slate-500">{formatDate(r.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '120px',
      render: (r) => (
        <div className="flex items-center gap-1">
          <a
            href={r.file_url}
            target="_blank" 
            rel="noopener noreferrer"
            title="View file"
          >
            <Button variant="ghost" size="sm" className="px-2">
              <Eye className="w-4 h-4" />
            </Button>
          </a>
          <a
            href={r.file_url}
            download={r.file_name}
            title="Download file" 
          >
            <Button variant="ghost" size="sm" className="px-2">
              <Download className="w-4 h-4" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(r)}
            className="px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Uploads"
        subtitle="Manage uploaded images and files used across the platform"
        actions={
          <Link to="/media-uploads/new">
            <Button size="sm">+ Upload file</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="p-4 border rounded-lg bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {MEDIA_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </Select>
          </div>

          {/* File Type Filter */}
          <div>
            <Select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
            >
              <option value="">All file types</option>
              <option value="image/">Images</option>
              <option value="video/">Videos</option>
              <option value="pdf">PDFs</option>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center">
            <Button 
              variant="secondary" 
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
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Upload date</option>
            <option value="file_name">File name</option>
            <option value="file_size">File size</option>
          </Select>
          <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
          
          {/* Results summary */}
          <div className="ml-auto text-sm text-slate-500">
            {loading ? 'Loading...' : `${data.total} files (${formatFileSize(
              data.items.reduce((sum, item) => sum + item.file_size, 0)
            )} total)`}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={loadUploads}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Results */}
      {data.items.length === 0 && !loading ? (
        <EmptyState
          icon={Image}
          title={hasActiveFilters ? "No matching files" : "No uploads yet"}
          description={
            hasActiveFilters 
              ? "Try adjusting your filters to see more results."
              : "Upload your first media file using the button above."
          }
          action={
            <Link to="/media-uploads/new">
              <Button size="sm">+ Upload file</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={data.items}
          rowKey={(r) => r.id}
          loading={loading}
          emptyMessage="No uploads found."
        />
      )}
    </div>
  );
}
