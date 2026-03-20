// ─── Media Uploads service ───────────────────────────────────────────────
// Admin operations for managing uploaded media files.

import { api, createResourceService } from '@/lib/api';
import type { MediaUpload } from '@/types';

const BASE = '/admin/media-uploads';

// ─── Core CRUD operations ──────────────────────────────────────────────────

export const mediaUploadsService = createResourceService<MediaUpload>(BASE);

// ─── File upload operation ─────────────────────────────────────────────────

export async function uploadFile(
  file: File, 
  category?: MediaCategory,
  description?: string
): Promise<MediaUpload> {
  const formData = new FormData();
  formData.append('file', file);
  if (category) formData.append('category', category);
  if (description) formData.append('description', description);

  // Use direct fetch for file upload since api client doesn't support FormData
  const response = await fetch('/api/admin/media-uploads/upload', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json();
}

// ─── File operations ───────────────────────────────────────────────────────

export async function deleteFile(fileId: number): Promise<void> {
  return api.delete<void>(`${BASE}/${fileId}`);
}

// ─── Media categories for organization ─────────────────────────────────────

export const MEDIA_CATEGORIES = [
  'destinations',
  'hotels', 
  'rooms',
  'transports',
  'avatars',
  'general'
] as const;

export type MediaCategory = typeof MEDIA_CATEGORIES[number];

// ─── List params with media-specific filters ───────────────────────────────

export interface MediaUploadListParams {
  page?: number;
  limit?: number;
  search?: string; // Search by filename
  category?: MediaCategory;
  file_type?: string; // e.g., 'image/jpeg'
  uploaded_by?: number; // User ID
  sort_by?: 'created_at' | 'file_name' | 'file_size';
  sort_order?: 'asc' | 'desc';
  [key: string]: unknown; // Index signature for compatibility
}

// ─── Utility functions ─────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function getFileTypeColor(fileType: string): 'info' | 'success' | 'warning' | 'neutral' {
  if (fileType.startsWith('image/')) return 'info';
  if (fileType.includes('pdf')) return 'warning';
  if (fileType.includes('video/')) return 'success';
  return 'neutral';
}

export function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

// ─── Category helpers ──────────────────────────────────────────────────────

export function getCategoryLabel(category: MediaCategory | undefined): string {
  const labels: Record<MediaCategory, string> = {
    destinations: 'Destinations',
    hotels: 'Hotels',
    rooms: 'Hotel Rooms', 
    transports: 'Transports',
    avatars: 'User Avatars',
    general: 'General'
  };
  return category ? labels[category] : 'Uncategorized';
}

export function getCategoryPath(category: MediaCategory | undefined): string {
  return category ? `/uploads/${category}/` : '/uploads/general/';
}