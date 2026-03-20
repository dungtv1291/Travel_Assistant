import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { DatabaseError } from '../../database/database.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { UserPreferencesRepository } from '../users/repositories/user-preferences.repository';
import { UserRefreshTokensRepository } from '../users/repositories/user-refresh-tokens.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** SHA-256 hex hash of a raw token string. Fast and deterministic for DB lookup. */
function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Parse simple duration string (e.g. "30d", "15m") into milliseconds. */
function parseDurationMs(duration: string): number {
  const match = /^(\d+)([mhd])$/.exec(duration);
  if (!match) return 30 * 24 * 60 * 60 * 1_000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'm') return value * 60 * 1_000;
  if (unit === 'h') return value * 60 * 60 * 1_000;
  return value * 24 * 60 * 60 * 1_000; // 'd'
}

// ---------------------------------------------------------------------------
// Response shapes (api-contract.md §2)
// ---------------------------------------------------------------------------

export interface UserShape {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  language: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly preferencesRepo: UserPreferencesRepository,
    private readonly refreshTokensRepo: UserRefreshTokensRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // -------------------------------------------------------------------------
  // Register — POST /auth/register
  // -------------------------------------------------------------------------

  async register(dto: RegisterDto): Promise<{ user: UserShape; tokens: TokenPair }> {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    let user;
    try {
      user = await this.usersRepo.insert({
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        language: dto.language ?? 'ko',
      });
    } catch (err) {
      if (err instanceof DatabaseError && err.isUniqueViolation) {
        throw new ConflictException('Email is already registered');
      }
      throw err;
    }

    // Seed empty preferences row so later reads never return null
    await this.preferencesRepo.initForUser(user.id);

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: this.toUserShape(user), tokens };
  }

  // -------------------------------------------------------------------------
  // Login — POST /auth/login
  // -------------------------------------------------------------------------

  async login(dto: LoginDto): Promise<{ user: UserShape; tokens: TokenPair }> {
    const user = await this.usersRepo.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (!user.is_active) throw new ForbiddenException('Account is inactive');

    // Fire-and-forget last_login_at update — non-critical
    void this.usersRepo.updateLastLogin(user.id);

    const tokens = await this.issueTokenPair(user.id, user.email);
    return { user: this.toUserShape(user), tokens };
  }

  // -------------------------------------------------------------------------
  // Refresh — POST /auth/refresh
  // -------------------------------------------------------------------------

  async refresh(rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = hashToken(rawRefreshToken);
    const record = await this.refreshTokensRepo.findActiveByHash(tokenHash);
    if (!record) throw new UnauthorizedException('Invalid or expired refresh token');

    // Rotate: revoke the consumed token before issuing a new pair
    await this.refreshTokensRepo.revoke(record.id);

    const user = await this.usersRepo.findByIdWithPassword(record.user_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.issueTokenPair(user.id, user.email);
  }

  // -------------------------------------------------------------------------
  // Logout — POST /auth/logout
  // -------------------------------------------------------------------------

  async logout(rawRefreshToken: string): Promise<{ message: string }> {
    const tokenHash = hashToken(rawRefreshToken);
    const record = await this.refreshTokensRepo.findActiveByHash(tokenHash);
    if (record) {
      await this.refreshTokensRepo.revoke(record.id);
    }
    // Idempotent: unknown/already-revoked tokens still return success
    return { message: 'Logged out successfully' };
  }

  // -------------------------------------------------------------------------
  // Current user — GET /auth/me
  // -------------------------------------------------------------------------

  async getMe(userId: number): Promise<UserShape & { preferredCurrency: string }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      language: user.language,
      preferredCurrency: user.preferred_currency,
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private async issueTokenPair(userId: number, email: string): Promise<TokenPair> {
    const accessToken = this.jwtService.sign({ sub: userId, email });

    const rawRefreshToken = randomUUID();
    const tokenHash = hashToken(rawRefreshToken);
    const refreshExpiresIn =
      this.config.get<string>('jwt.refreshExpiresIn') ?? '30d';
    const expiresAt = new Date(Date.now() + parseDurationMs(refreshExpiresIn));

    await this.refreshTokensRepo.insert({ userId, tokenHash, expiresAt });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private toUserShape(user: {
    id: number;
    email: string;
    full_name: string;
    avatar_url: string | null;
    language: string;
  }): UserShape {
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      language: user.language,
    };
  }
}
