import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apply to any controller or route that requires a valid JWT access token.
 *
 *   @UseGuards(JwtAuthGuard)
 *
 * On success Passport calls JwtStrategy.validate() and puts the result in
 * request.user. Use @CurrentUser() to extract it inside the handler.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
