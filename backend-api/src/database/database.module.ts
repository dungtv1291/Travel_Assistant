import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Global module — DatabaseService is available in every module without re-importing.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
