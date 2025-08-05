import { Module } from '@nestjs/common';
import { EnvConfigService } from './env.config';

@Module({
  providers: [EnvConfigService],
  exports: [EnvConfigService],
})
export class ConfigModule {} 