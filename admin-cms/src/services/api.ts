// Backward-compat re-export — keeps auth.service.ts and useAuth.tsx working.
// All logic now lives in @/lib/api. Do not add code here.
export { api, ApiError, saveTokens, clearTokens, hasAccessToken } from '@/lib/api';
