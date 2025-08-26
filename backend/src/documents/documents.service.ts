import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(documentData: any) {
    return this.prisma.document.create({
      data: documentData
    });
  }

  async findAll(userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) {
      return this.prisma.document.findMany({
        include: {
          expediente: {
            select: {
              id: true,
              title: true
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    }

    // Para usuarios no-admin, solo mostrar sus propios documentos
    return this.prisma.document.findMany({
      where: {
        uploadedBy: userId
      },
      include: {
        expediente: {
          select: {
            id: true,
            title: true
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
  }

  async findOne(id: string, userId: string, userRole: Role) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          select: {
            id: true,
            title: true
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos
    if (userRole !== Role.ADMIN && document.uploadedBy !== userId) {
      throw new ForbiddenException('No tienes permisos para acceder a este documento');
    }

    return document;
  }

  async findMyDocuments(userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) {
      return this.findAll(userId, userRole);
    }

    return this.prisma.document.findMany({
      where: {
        uploadedBy: userId
      },
      include: {
        expediente: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
  }

  async findByExpediente(expedienteId: string, userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) {
      return this.prisma.document.findMany({
        where: { expedienteId },
        include: {
          expediente: {
            select: {
              id: true,
              title: true
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    }

    // Para usuarios no-admin, solo mostrar documentos de expedientes a los que tienen acceso
    return this.prisma.document.findMany({
      where: {
        expedienteId,
        uploadedBy: userId
      },
      include: {
        expediente: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
  }

  async remove(id: string, userId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    if (document.uploadedBy !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este documento');
    }

    return this.prisma.document.delete({
      where: { id }
    });
  }

  async getDocumentsStats(userId: string, userRole: Role) {
    if (userRole === Role.ADMIN) {
      const total = await this.prisma.document.count();
      const byType = await this.prisma.document.groupBy({
        by: ['mimeType'],
        _count: {
          mimeType: true
        }
      });

      return {
        total,
        byType,
        userRole: 'admin'
      };
    }

    const total = await this.prisma.document.count({
      where: { uploadedBy: userId }
    });

    const byType = await this.prisma.document.groupBy({
      by: ['mimeType'],
      where: { uploadedBy: userId },
      _count: {
        mimeType: true
      }
    });

    return {
      total,
      byType,
      userRole: 'user'
    };
  }
} 