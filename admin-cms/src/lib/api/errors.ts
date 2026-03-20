// ─── Normalized API error types ───────────────────────────────────────────

/**
 * A structured field-level validation error.
 * Surfaces NestJS class-validator messages when the backend returns them.
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * Normalized error thrown by all API calls.
 *
 * - `statusCode` — HTTP status (0 for network/parse failures)
 * - `message`    — Human-readable summary, safe to show in UI
 * - `fields`     — Optional per-field validation errors from the backend
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly fields: FieldError[];

  constructor(statusCode: number, message: string, fields: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.fields = fields;
    // Needed when extending built-ins in TypeScript with ES5 targets
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ─── Guards and helpers ────────────────────────────────────────────────────

/** Narrows `unknown` to `ApiError`. */
export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

/**
 * Converts any caught value into an `ApiError`.
 * Safe to call in any `catch` block regardless of what was thrown.
 */
export function normalizeError(err: unknown): ApiError {
  if (isApiError(err)) return err;
  if (err instanceof Error) return new ApiError(0, err.message);
  if (typeof err === 'string') return new ApiError(0, err);
  return new ApiError(0, 'An unexpected error occurred');
}

/**
 * Extracts a display-safe message string from any caught value.
 *
 * @example
 *   catch (err) { setError(getErrorMessage(err)); }
 */
export function getErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'An unexpected error occurred';
}

/**
 * Returns field-level errors as a Record keyed by field name.
 * Useful for wiring into react-hook-form's `setError`.
 *
 * @example
 *   const fieldErrors = getFieldErrors(err);
 *   Object.entries(fieldErrors).forEach(([field, message]) =>
 *     form.setError(field, { message }),
 *   );
 */
export function getFieldErrors(err: unknown): Record<string, string> {
  if (!isApiError(err) || err.fields.length === 0) return {};
  return Object.fromEntries(err.fields.map((f) => [f.field, f.message]));
}
