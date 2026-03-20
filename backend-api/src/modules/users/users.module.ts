import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { UserPreferencesRepository } from './repositories/user-preferences.repository';
import { UserRefreshTokensRepository } from './repositories/user-refresh-tokens.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UserPreferencesRepository,
    UserRefreshTokensRepository,
  ],
  // Export repositories so AuthModule can inject them into AuthService
  exports: [
    UsersService,
    UsersRepository,
    UserPreferencesRepository,
    UserRefreshTokensRepository,
  ],
})
export class UsersModule {}
