// ─── Generic CRUD resource helpers ────────────────────────────────────────
// These helpers let service files define per-resource API access in a few
// lines without any boilerplate. Pages import the service, not the helpers.

import { api } from './client';
import { buildQueryString } from './config';
import type { PaginatedResponse } from '@/types';

// ─── Shared param types ────────────────────────────────────────────────────

/**
 * Standard pagination + search params accepted by all list endpoints.
 * Extend per-module with stricter typed params when needed.
 *
 * @example
 *   interface DestinationListParams extends ListParams {
 *     is_active?: boolean;
 *     is_featured?: boolean;
 *   }
 */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// ─── Individual helpers ────────────────────────────────────────────────────

/**
 * Fetches a paginated list from a resource endpoint.
 *
 * @example
 *   const result = await listResource<Destination>('/admin/destinations', { page: 1, limit: 25 });
 */
export function listResource<T>(
  basePath: string,
  params: ListParams = {},
): Promise<PaginatedResponse<T>> {
  const qs = buildQueryString(params as Record<string, unknown>);
  return api.get<PaginatedResponse<T>>(`${basePath}${qs}`);
}

/**
 * Fetches a single record by ID.
 *
 * @example
 *   const hotel = await getResource<Hotel>('/admin/hotels', 42);
 */
export function getResource<T>(basePath: string, id: number | string): Promise<T> {
  return api.get<T>(`${basePath}/${id}`);
}

/**
 * Creates a new record. Returns the created entity.
 *
 * @example
 *   const created = await createResource<Destination>('/admin/destinations', formValues);
 */
export function createResource<T>(basePath: string, body: unknown): Promise<T> {
  return api.post<T>(basePath, body);
}

/**
 * Partially updates a record (PATCH semantics). Returns the updated entity.
 *
 * @example
 *   const updated = await updateResource<Hotel>('/admin/hotels', 42, { is_active: false });
 */
export function updateResource<T>(
  basePath: string,
  id: number | string,
  body: unknown,
): Promise<T> {
  return api.patch<T>(`${basePath}/${id}`, body);
}

/**
 * Deletes a record by ID.
 *
 * @example
 *   await deleteResource('/admin/destinations', 42);
 */
export function deleteResource(basePath: string, id: number | string): Promise<void> {
  return api.delete<void>(`${basePath}/${id}`);
}

// ─── Service factory ───────────────────────────────────────────────────────

/**
 * Creates a typed CRUD service object bound to a fixed resource path.
 * This is the recommended way to build per-module services.
 *
 * @example
 *   // src/services/destinations.service.ts
 *   import { createResourceService } from '@/lib/api';
 *   import type { Destination } from '@/types';
 *
 *   export const destinationsService = createResourceService<Destination>('/admin/destinations');
 *
 *   // In a page:
 *   const { items, total } = await destinationsService.list({ page: 1, limit: 25 });
 *   const dest = await destinationsService.get(42);
 *   await destinationsService.delete(42);
 */
export function createResourceService<T>(basePath: string) {
  return {
    list: (params?: ListParams) => listResource<T>(basePath, params),
    get: (id: number | string) => getResource<T>(basePath, id),
    create: (body: unknown) => createResource<T>(basePath, body),
    update: (id: number | string, body: unknown) => updateResource<T>(basePath, id, body),
    delete: (id: number | string) => deleteResource(basePath, id),
    /** Raw path access for sub-resource endpoints, e.g. /admin/destinations/42/badges */
    path: basePath,
  };
}

/** Inferred return type of the service factory — useful for type annotations. */
export type ResourceService<T> = ReturnType<typeof createResourceService<T>>;
