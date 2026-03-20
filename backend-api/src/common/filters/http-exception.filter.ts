import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Catches all exceptions and formats them as the standard error envelope:
 *   { "success": false, "error": { "code", "message", "details" } }
 *
 * Aligns with api-contract.md §1.5.
 * Applied globally in main.ts — registered BEFORE the transform interceptor.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.httpStatusToCode(status);
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        // class-validator surfaces an array of messages; flatten into details
        if (Array.isArray(resp['message'])) {
          details = resp['message'] as unknown[];
          message = 'Validation failed';
          code = 'VALIDATION_ERROR';
        } else {
          message = (resp['message'] as string) ?? exception.message;
          code =
            typeof resp['error'] === 'string'
              ? (resp['error'] as string)
              : this.httpStatusToCode(status);
        }
      }

      code = this.normalizeCode(code);
    } else {
      // Unexpected error — log stack but don't leak internals
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message, details },
    });
  }

  private httpStatusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
    };
    return map[status] ?? 'INTERNAL_SERVER_ERROR';
  }

  private normalizeCode(code: string): string {
    return code.toUpperCase().replace(/[\s-]/g, '_');
  }
}
