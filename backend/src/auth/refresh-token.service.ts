import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  role: string;
  tokenId: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Genera un refresh token y lo almacena en la base de datos
   */
  async generateRefreshToken(userId: string, email: string, role: string): Promise<string> {
    const tokenId = crypto.randomUUID();
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        role,
        tokenId,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }
    );

    // Almacenar el refresh token en la base de datos
    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        userId,
        token: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        isRevoked: false,
      },
    });

    return refreshToken;
  }

  /**
   * Valida un refresh token y genera un nuevo access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verificar el token JWT
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        { secret: this.configService.get<string>('JWT_REFRESH_SECRET') }
      );

      // Verificar que el token existe en la base de datos y no está revocado
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }

      // Verificar que el hash del token coincide
      if (storedToken.token !== this.hashToken(refreshToken)) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Generar nuevo access token
      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        }
      );

      // Generar nuevo refresh token (rotación de tokens)
      const newRefreshToken = await this.generateRefreshToken(payload.sub, payload.email, payload.role);

      // Revocar el token anterior
      await this.revokeRefreshToken(payload.tokenId);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  /**
   * Revoca un refresh token
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Limpia tokens expirados
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  /**
   * Obtiene información de los tokens activos de un usuario
   */
  async getUserActiveTokens(userId: string): Promise<any[]> {
    return this.prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        userAgent: true,
        ipAddress: true,
      },
    });
  }

  /**
   * Hashea un token para almacenamiento seguro
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Valida un refresh token sin generar nuevos tokens
   */
  async validateRefreshToken(refreshToken: string): Promise<RefreshTokenPayload | null> {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        { secret: this.configService.get<string>('JWT_REFRESH_SECRET') }
      );

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        return null;
      }

      if (storedToken.token !== this.hashToken(refreshToken)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Registra información adicional del token (user agent, IP, etc.)
   */
  async updateTokenMetadata(tokenId: string, userAgent?: string, ipAddress?: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        userAgent,
        ipAddress,
      },
    });
  }
} 