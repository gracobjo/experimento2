import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(documentData: any) {
    try {
      const document = await this.prisma.document.create({
        data: {
          filename: documentData.filename,
          originalName: documentData.originalName,
          mimeType: documentData.mimeType,
          fileSize: documentData.size,
          fileUrl: documentData.fileUrl,
          description: documentData.description,
          expedienteId: documentData.expedienteId,
          uploadedBy: documentData.uploadedBy,
          metadata: documentData.metadata || {}
        }
      });

      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async findAll(userId: string, userRole: Role) {
    try {
      if (userRole === Role.ADMIN) {
        // Admin ve todos los documentos
        return await this.prisma.document.findMany({
          include: {
            expediente: true,
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
      } else if (userRole === Role.ABOGADO) {
        // Abogado ve documentos de sus expedientes
        const expedientes = await this.prisma.expediente.findMany({
          where: {
            lawyerId: userId
          },
          select: {
            id: true
          }
        });

        const expedienteIds = expedientes.map(exp => exp.id);

        return await this.prisma.document.findMany({
          where: {
            expedienteId: {
              in: expedienteIds
            }
          },
          include: {
            expediente: true,
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
      } else {
        // Cliente ve solo documentos de sus expedientes
        const expedientes = await this.prisma.expediente.findMany({
          where: {
            clientId: userId
          },
          select: {
            id: true
          }
        });

        const expedienteIds = expedientes.map(exp => exp.id);

        return await this.prisma.document.findMany({
          where: {
            expedienteId: {
              in: expedienteIds
            }
          },
          include: {
            expediente: true,
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
    } catch (error) {
      console.error('Error finding all documents:', error);
      throw error;
    }
  }

  async findMyDocuments(userId: string, userRole: Role) {
    try {
      if (userRole === Role.ADMIN) {
        // Admin ve todos los documentos
        return await this.prisma.document.findMany({
          include: {
            expediente: true,
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
      } else if (userRole === Role.ABOGADO) {
        // Abogado ve documentos de sus expedientes
        const expedientes = await this.prisma.expediente.findMany({
          where: {
            lawyerId: userId
          },
          select: {
            id: true
          }
        });

        const expedienteIds = expedientes.map(exp => exp.id);

        return await this.prisma.document.findMany({
          where: {
            expedienteId: {
              in: expedienteIds
            }
          },
          include: {
            expediente: true,
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
      } else {
        // Cliente ve solo documentos de sus expedientes
        const expedientes = await this.prisma.expediente.findMany({
          where: {
            clientId: userId
          },
          select: {
            id: true
          }
        });

        const expedienteIds = expedientes.map(exp => exp.id);

        return await this.prisma.document.findMany({
          where: {
            expedienteId: {
              in: expedienteIds
            }
          },
          include: {
            expediente: true,
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
    } catch (error) {
      console.error('Error finding my documents:', error);
      throw error;
    }
  }

  async findOne(id: string, userId: string, userRole: Role) {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          expediente: true,
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
        throw new NotFoundException(`Documento no encontrado: ${id}`);
      }

      // Verificar permisos
      if (userRole === Role.ADMIN) {
        return document;
      } else if (userRole === Role.ABOGADO) {
        // Verificar si el abogado tiene acceso al expediente
        if (document.expediente && document.expediente.lawyerId === userId) {
          return document;
        } else {
          throw new ForbiddenException('No tienes acceso a este documento');
        }
      } else {
        // Cliente - verificar si tiene acceso al expediente
        if (document.expediente && document.expediente.clientId === userId) {
          return document;
        } else {
          throw new ForbiddenException('No tienes acceso a este documento');
        }
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error finding document:', error);
      throw error;
    }
  }

  async findByExpediente(expedienteId: string, userId: string, userRole: Role) {
    try {
      // Verificar permisos para el expediente
      const expediente = await this.prisma.expediente.findUnique({
        where: { id: expedienteId },
        select: {
          id: true,
          lawyerId: true,
          clientId: true
        }
      });

      if (!expediente) {
        throw new NotFoundException(`Expediente no encontrado: ${expedienteId}`);
      }

      // Verificar acceso
      if (userRole === Role.ADMIN) {
        // Admin puede acceder a cualquier expediente
      } else if (userRole === Role.ABOGADO) {
        if (expediente.lawyerId !== userId) {
          throw new ForbiddenException('No tienes acceso a este expediente');
        }
      } else {
        // Cliente
        if (expediente.clientId !== userId) {
          throw new ForbiddenException('No tienes acceso a este expediente');
        }
      }

      // Obtener documentos del expediente
      return await this.prisma.document.findMany({
        where: {
          expedienteId: expedienteId
        },
        include: {
          expediente: true,
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
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error finding documents by expediente:', error);
      throw error;
    }
  }

  async getDocumentsStats(userId: string, userRole: Role) {
    try {
      let documents;

      if (userRole === Role.ADMIN) {
        documents = await this.prisma.document.findMany();
      } else if (userRole === Role.ABOGADO) {
        const expedientes = await this.prisma.expediente.findMany({
          where: { lawyerId: userId },
          select: { id: true }
        });
        const expedienteIds = expedientes.map(exp => exp.id);
        documents = await this.prisma.document.findMany({
          where: {
            expedienteId: { in: expedienteIds }
          }
        });
      } else {
        const expedientes = await this.prisma.expediente.findMany({
          where: { clientId: userId },
          select: { id: true }
        });
        const expedienteIds = expedientes.map(exp => exp.id);
        documents = await this.prisma.document.findMany({
          where: {
            expedienteId: { in: expedienteIds }
          }
        });
      }

      const totalDocuments = documents.length;
      const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

      // Contar por tipo
      const documentsByType = {
        pdf: documents.filter(doc => doc.mimeType === 'application/pdf').length,
        doc: documents.filter(doc => 
          doc.mimeType === 'application/msword' || 
          doc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ).length,
        image: documents.filter(doc => 
          doc.mimeType && doc.mimeType.startsWith('image/')
        ).length,
        other: documents.filter(doc => 
          doc.mimeType && 
          doc.mimeType !== 'application/pdf' &&
          doc.mimeType !== 'application/msword' &&
          doc.mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
          !doc.mimeType.startsWith('image/')
        ).length
      };

      // Documentos recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = documents.filter(doc => 
        doc.uploadedAt && new Date(doc.uploadedAt) > sevenDaysAgo
      ).length;

      return {
        totalDocuments,
        totalSize,
        documentsByType,
        recentUploads
      };
    } catch (error) {
      console.error('Error getting documents stats:', error);
      throw error;
    }
  }

  async remove(id: string, userId: string, userRole: Role) {
    try {
      // Verificar permisos
      if (userRole !== Role.ADMIN && userRole !== Role.ABOGADO) {
        throw new ForbiddenException('Solo ADMIN y ABOGADO pueden eliminar documentos');
      }

      // Verificar si el documento existe
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          expediente: true
        }
      });

      if (!document) {
        throw new NotFoundException(`Documento no encontrado: ${id}`);
      }

      // Verificar acceso específico para ABOGADO
      if (userRole === Role.ABOGADO) {
        if (document.expediente && document.expediente.lawyerId !== userId) {
          throw new ForbiddenException('No puedes eliminar documentos de otros expedientes');
        }
      }

      // Eliminar documento
      const deletedDocument = await this.prisma.document.delete({
        where: { id }
      });

      return deletedDocument;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error removing document:', error);
      throw error;
    }
  }
} 