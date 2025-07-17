import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtBlacklistService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Agrega un token JWT al blacklist
   */
  async blacklistToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    const tokenHash = this.hashToken(token);
    
    await this.prisma.blacklistedToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        blacklistedAt: new Date(),
      },
    });
  }

  /**
   * Verifica si un token está en el blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    
    const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
      where: { tokenHash },
    });

    return !!blacklistedToken;
  }

  /**
   * Limpia tokens expirados del blacklist
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  /**
   * Obtiene estadísticas del blacklist
   */
  async getBlacklistStats(): Promise<{
    totalBlacklisted: number;
    expiredTokens: number;
    activeTokens: number;
  }> {
    const totalBlacklisted = await this.prisma.blacklistedToken.count();
    const expiredTokens = await this.prisma.blacklistedToken.count({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return {
      totalBlacklisted,
      expiredTokens,
      activeTokens: totalBlacklisted - expiredTokens,
    };
  }

  /**
   * Hashea un token para almacenamiento seguro
   */
  private hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Blacklist todos los tokens de un usuario (logout de todos los dispositivos)
   */
  async blacklistAllUserTokens(userId: string): Promise<void> {
    // Obtener todos los tokens activos del usuario
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Blacklist cada token
    for (const token of activeTokens) {
      await this.blacklistToken(token.token, userId, token.expiresAt);
    }

    // Revocar todos los refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  /**
   * Verifica y limpia tokens automáticamente
   */
  async performMaintenance(): Promise<void> {
    // Limpiar tokens expirados del blacklist
    await this.cleanupExpiredTokens();

    // Limpiar refresh tokens expirados
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
} 