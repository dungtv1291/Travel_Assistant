import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Wraps every successful handler response in the standard envelope:
 *   { "success": true, "data": <original response> }
 *
 * Aligns with api-contract.md §1.3.
 * Applied globally in main.ts.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data: T) => ({ success: true as const, data })),
    );
  }
}
