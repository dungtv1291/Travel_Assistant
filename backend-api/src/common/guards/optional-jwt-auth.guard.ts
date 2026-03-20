import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apply to public endpoints that include isFavorite or other user-specific fields.
 *
 *   @UseGuards(OptionalJwtAuthGuard)
 *
 * If a valid Bearer token is present, Passport validates it and sets request.user.
 * If no token (or an invalid one) is present, request.user is undefined — the
 * request continues without throwing UnauthorizedException.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest<T>(_err: any, user: T): T {
    // Deliberately ignore errors — unauthenticated callers are allowed
    return user;
  }
}
