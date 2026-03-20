// Base API client — shared delay utility for mock services + real HTTP client.
// Real HTTP implementation lives in services/http/http.client.ts.
export { httpClient as apiClient } from './http/http.client';

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
