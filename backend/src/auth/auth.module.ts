import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { EmailService } from './email.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EnvConfigService } from '../config/env.config';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [EnvConfigService],
      useFactory: async (envConfigService: EnvConfigService) => ({
        secret: envConfigService.getJwtSecret(),
        signOptions: {
          expiresIn: envConfigService.getJwtExpiresIn(),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, EmailService, EnvConfigService],
  controllers: [AuthController],
  exports: [AuthService, EmailService],
})
export class AuthModule {} 