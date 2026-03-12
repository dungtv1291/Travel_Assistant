// Base API client — replace mock implementations with real HTTP calls here
const API_BASE_URL = 'https://api.vietnamtravel.app/v1'; // future backend

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    // TODO: Replace with real fetch call
    throw new Error(`GET ${API_BASE_URL}${endpoint} not yet implemented`);
  },
  post: async <T>(endpoint: string, _body: unknown): Promise<T> => {
    throw new Error(`POST ${API_BASE_URL}${endpoint} not yet implemented`);
  },
};
