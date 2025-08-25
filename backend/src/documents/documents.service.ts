import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  // Configuración de archivos permitidos
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_FILES_PER_CASE = 5;
  private readonly UPLOAD_DIR = 'uploads';

  async uploadDocument(
    file: any,
    uploadDocumentDto: UploadDocumentDto,
    currentUserId: string,
    userRole: string
  ) {
    // Validar expediente
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: uploadDocumentDto.expedienteId },
      include: {
        client: true,
        lawyer: true,
        documents: true,
      }
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client || expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para subir documentos a este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para subir documentos a este expediente');
      }
    }
    // Los admins pueden subir documentos a cualquier expediente

    // Validar límite de archivos
    if (expediente.documents.length >= this.MAX_FILES_PER_CASE) {
      throw new BadRequestException(`No se pueden subir más de ${this.MAX_FILES_PER_CASE} archivos por expediente`);
    }

    // Validar archivo
    this.validateFile(file);

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;

    // Guardar archivo directamente en PostgreSQL
    const document = await this.prisma.document.create({
      data: {
        filename: uniqueFilename,
        originalName: file.originalname,
        fileUrl: null, // No necesitamos URL externa
        fileData: file.buffer, // Almacenar directamente en PostgreSQL
        fileSize: file.size,
        mimeType: file.mimetype,
        description: uploadDocumentDto.description,
        expedienteId: uploadDocumentDto.expedienteId,
        uploadedBy: currentUserId,
      },
      include: {
        expediente: {
          include: {
            client: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            },
            lawyer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      }
    });

    return document;
  }

  // Métodos simples para reemplazar Cloudinary
  async findMyDocuments(userId: string, userRole: string) {
    try {
      console.log(`🔍 DocumentsService.findMyDocuments - userId: ${userId}, userRole: ${userRole}`);
      
      if (userRole === 'CLIENTE') {
        const client = await this.prisma.client.findUnique({
          where: { userId }
        });
        
        if (!client) {
          return [];
        }

        // Obtener documentos básicos primero
        const documents = await this.prisma.document.findMany({
          where: {
            expediente: {
              clientId: client.id
            }
          },
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            description: true,
            expedienteId: true,
            uploadedBy: true,
            uploadedAt: true,
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        });

        // Obtener información del expediente
        const documentsWithExpediente = await Promise.all(
          documents.map(async (doc) => {
            try {
              let expedienteInfo = null;
              if (doc.expedienteId) {
                const expediente = await this.prisma.expediente.findUnique({
                  where: { id: doc.expedienteId },
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                });
                expedienteInfo = expediente;
              }

              return {
                ...doc,
                expediente: expedienteInfo
              };
            } catch (error: any) {
              console.log(`⚠️ Error procesando documento ${doc.id}:`, error?.message || 'Error desconocido');
              return {
                ...doc,
                expediente: null
              };
            }
          })
        );

        return documentsWithExpediente;
        
      } else if (userRole === 'ABOGADO') {
        // Obtener documentos básicos primero
        const documents = await this.prisma.document.findMany({
          where: {
            expediente: {
              lawyerId: userId
            }
          },
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            description: true,
            expedienteId: true,
            uploadedBy: true,
            uploadedAt: true,
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        });

        // Obtener información del expediente
        const documentsWithExpediente = await Promise.all(
          documents.map(async (doc) => {
            try {
              let expedienteInfo = null;
              if (doc.expedienteId) {
                const expediente = await this.prisma.expediente.findUnique({
                  where: { id: doc.expedienteId },
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                });
                expedienteInfo = expediente;
              }

              return {
                ...doc,
                expediente: expedienteInfo
              };
            } catch (error: any) {
              console.log(`⚠️ Error procesando documento ${doc.id}:`, error?.message || 'Error desconocido');
              return {
                ...doc,
                expediente: null
              };
            }
          })
        );

        return documentsWithExpediente;
        
      } else {
        // ADMIN puede ver todos (usar el método findAll)
        return this.findAll(userId, userRole);
      }
    } catch (error: any) {
      console.error(`❌ Error en DocumentsService.findMyDocuments:`, error);
      throw new BadRequestException('Error interno del servidor al obtener mis documentos');
    }
  }

  async findAll(userId: string, userRole: string) {
    try {
      console.log(`🔍 DocumentsService.findAll - userId: ${userId}, userRole: ${userRole}`);
      
      if (userRole === 'ADMIN') {
        // Para admin, obtener todos los documentos básicos primero
        const documents = await this.prisma.document.findMany({
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            description: true,
            expedienteId: true,
            uploadedBy: true,
            uploadedAt: true,
          },
          orderBy: {
            uploadedAt: 'desc'
          }
        });

        console.log(`📊 Documentos básicos encontrados: ${documents.length}`);

        // Obtener información del expediente para cada documento
        const documentsWithExpediente = await Promise.all(
          documents.map(async (doc) => {
            try {
              let expedienteInfo = null;
              if (doc.expedienteId) {
                const expediente = await this.prisma.expediente.findUnique({
                  where: { id: doc.expedienteId },
                  select: {
                    id: true,
                    title: true,
                    status: true
                  }
                });
                expedienteInfo = expediente;
              }

              return {
                ...doc,
                expediente: expedienteInfo
              };
            } catch (error: any) {
              console.log(`⚠️ Error procesando documento ${doc.id}:`, error?.message || 'Error desconocido');
              return {
                ...doc,
                expediente: null
              };
            }
          })
        );

        console.log(`📊 Documentos procesados exitosamente: ${documentsWithExpediente.length}`);
        return documentsWithExpediente;
      } else {
        return this.findMyDocuments(userId, userRole);
      }
    } catch (error) {
      console.error(`❌ Error en DocumentsService.findAll:`, error);
      throw new BadRequestException('Error interno del servidor al obtener documentos');
    }
  }

  async findByExpediente(expedienteId: string, userId: string, userRole: string) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: expedienteId },
      include: {
        client: true,
        lawyer: true
      }
    });

    if (!expediente) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId }
      });
      
      if (!client || expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== userId) {
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    }

    return this.prisma.document.findMany({
      where: { expedienteId },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async findOne(id: string, userId: string, userRole: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== userId) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    }

    return document;
  }

  async remove(id: string, userId: string, userRole: string) {
    const document = await this.findOne(id, userId, userRole);
    
    // Solo el propietario o admin puede eliminar
    if (userRole !== 'ADMIN' && document.uploadedBy !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este documento');
    }

    // Eliminar archivo físico si existe
    if (document.fileUrl && document.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'uploads', document.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar de la base de datos
    await this.prisma.document.delete({
      where: { id }
    });

    return { message: 'Documento eliminado exitosamente' };
  }

  async getDocumentsStats(currentUserId: string, userRole: string) {
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
      
      whereClause = {
        expediente: {
          clientId: client.id
        }
      };
    } else if (userRole === 'ABOGADO') {
      whereClause = {
        expediente: {
          lawyerId: currentUserId
        }
      };
    }
    // Los admins ven estadísticas de todos los documentos

    const [total, totalSize, byType] = await Promise.all([
      this.prisma.document.count({ where: whereClause }),
      this.prisma.document.aggregate({
        where: whereClause,
        _sum: {
          fileSize: true
        }
      }),
      this.prisma.document.groupBy({
        by: ['mimeType'],
        where: whereClause,
        _count: {
          id: true
        }
      })
    ]);

    return {
      total,
      totalSize: totalSize._sum.fileSize || 0,
      byType: byType.map(type => ({
        type: type.mimeType,
        count: type._count.id
      }))
    };
  }

  private validateFile(file: any) {
    // Validar tipo de archivo
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Tipos permitidos: PDF, TXT, DOC, DOCX, JPG, PNG, GIF, WEBP`
      );
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo de ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      );
    }

    // Validar que el archivo no esté vacío
    if (file.size === 0) {
      throw new BadRequestException('El archivo no puede estar vacío');
    }
  }



  getFilePath(filename: string): string {
    return path.join(process.cwd(), this.UPLOAD_DIR, filename);
  }

  async checkFileAccess(filename: string, currentUserId: string, userRole: string): Promise<boolean> {
    try {
      // Buscar el documento por nombre de archivo
      const document = await this.prisma.document.findFirst({
        where: { filename },
        include: {
          expediente: {
            include: {
              client: true,
              lawyer: true
            }
          }
        }
      });

      if (!document) {
        return false;
      }

      // Los admins tienen acceso a todos los archivos
      if (userRole === 'ADMIN') {
        return true;
      }

      // Los abogados pueden acceder a archivos de sus expedientes
      if (userRole === 'ABOGADO' && document.expediente.lawyerId === currentUserId) {
        return true;
      }

      // Los clientes pueden acceder a archivos de sus expedientes
      if (userRole === 'CLIENTE') {
        const client = await this.prisma.client.findUnique({
          where: { userId: currentUserId }
        });
        
        if (client && document.expediente.clientId === client.id) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking file access:', error);
      return false;
    }
  }

  // Método para obtener archivo como stream desde PostgreSQL
  async getFileStream(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      select: {
        fileData: true,
        mimeType: true,
        originalName: true,
        fileSize: true,
        uploadedAt: true,
      }
    });

    if (!document || !document.fileData) {
      throw new NotFoundException('Archivo no encontrado o sin datos');
    }

    // Crear un stream desde el buffer
    const { Readable } = require('stream');
    const stream = Readable.from(document.fileData);

    // Agregar metadatos al stream
    stream.metadata = {
      contentType: document.mimeType,
      contentLength: document.fileSize,
      lastModified: document.uploadedAt,
    };

    return {
      stream,
      metadata: stream.metadata
    };
  }


} 