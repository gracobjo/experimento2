import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryDocumentsService {
  private readonly logger = new Logger(CloudinaryDocumentsService.name);

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

  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (límite de Cloudinary gratuito)
  private readonly MAX_FILES_PER_CASE = 5;

  constructor(
    private prisma: PrismaService,
    private cloudinaryStorage: CloudinaryStorageService,
    private configService: ConfigService
  ) {}

  async uploadDocument(
    file: any,
    uploadDocumentDto: UploadDocumentDto,
    currentUserId: string,
    userRole: string
  ) {
    this.logger.log(`Iniciando upload de documento: ${file.originalname}`);

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

    try {
      // Subir archivo a Cloudinary
      const uploadResult = await this.cloudinaryStorage.uploadFile(
        file,
        `experimento2/expedientes/${expediente.id}`,
        {
          expedienteId: expediente.id,
          uploadedBy: currentUserId,
          userRole: userRole,
          originalName: file.originalname,
          description: uploadDocumentDto.description
        }
      );

      this.logger.log(`Archivo subido exitosamente a Cloudinary: ${uploadResult.publicId}`);

      // Guardar información en base de datos
      const document = await this.prisma.document.create({
        data: {
          filename: `${uploadResult.publicId}.${file.originalname.split('.').pop()}`, // Añadir extensión para compatibilidad
          originalName: file.originalname,
          fileUrl: uploadResult.url, // URL de Cloudinary
          fileSize: file.size,
          mimeType: file.mimetype,
          description: uploadDocumentDto.description,
          expedienteId: uploadDocumentDto.expedienteId,
          uploadedBy: currentUserId,
          // Agregar metadatos de Cloudinary
          metadata: {
            cloudinaryPublicId: uploadResult.publicId, // Sin extensión
            storageType: 'cloudinary',
            cloudinaryUrl: uploadResult.url
          } as any
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

      this.logger.log(`Documento guardado en base de datos: ${document.id}`);
      return document;

    } catch (error) {
      this.logger.error(`Error subiendo documento a Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException(`Error subiendo documento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async downloadDocument(documentId: string, currentUserId: string, userRole: string) {
    this.logger.log(`Iniciando descarga de documento: ${documentId}`);

    // Buscar documento
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
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
        where: { userId: currentUserId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para descargar este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para descargar este documento');
      }
    }
    // Los admins pueden descargar cualquier documento

    try {
      // Obtener el publicId de Cloudinary desde los metadatos o migrar si es necesario
      let cloudinaryPublicId = (document.metadata as any)?.cloudinaryPublicId;
      
      if (!cloudinaryPublicId) {
        // El documento no tiene metadatos de Cloudinary, intentar migrarlo
        this.logger.log(`Documento ${documentId} no tiene metadatos de Cloudinary, intentando migración...`);
        cloudinaryPublicId = await this.migrateDocumentToCloudinary(document);
      }
      
      // Descargar archivo de Cloudinary
      const downloadResult = await this.cloudinaryStorage.downloadFile(cloudinaryPublicId);
      
      this.logger.log(`Documento descargado exitosamente de Cloudinary: ${cloudinaryPublicId}`);

      return {
        stream: downloadResult.stream,
        metadata: {
          ...downloadResult.metadata,
          originalName: document.originalName,
          description: document.description,
          expedienteId: document.expedienteId,
          uploadedAt: document.uploadedAt,
        }
      };

    } catch (error) {
      this.logger.error(`Error descargando documento de Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      throw new NotFoundException(`Error descargando documento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDocumentInfo(documentId: string, currentUserId: string, userRole: string) {
    // Buscar documento
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
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
        where: { userId: currentUserId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    }

    try {
      // Obtener el publicId de Cloudinary desde los metadatos o migrar si es necesario
      let cloudinaryPublicId = (document.metadata as any)?.cloudinaryPublicId;
      
      if (!cloudinaryPublicId) {
        // El documento no tiene metadatos de Cloudinary, intentar migrarlo
        this.logger.log(`Documento ${documentId} no tiene metadatos de Cloudinary, intentando migración...`);
        cloudinaryPublicId = await this.migrateDocumentToCloudinary(document);
      }
      
      // Obtener metadatos de Cloudinary
      const cloudinaryInfo = await this.cloudinaryStorage.getFileMetadata(cloudinaryPublicId);
      
      return {
        ...document,
        cloudinaryInfo: {
          publicId: cloudinaryInfo.publicId,
          resourceType: cloudinaryInfo.resourceType,
          format: cloudinaryInfo.format,
          size: cloudinaryInfo.size,
          createdAt: cloudinaryInfo.createdAt,
          url: cloudinaryInfo.url
        }
      };

    } catch (error) {
      this.logger.warn(`No se pudieron obtener metadatos de Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      return document;
    }
  }

  async deleteDocument(documentId: string, currentUserId: string, userRole: string) {
    this.logger.log(`Iniciando eliminación de documento: ${documentId}`);

    // Buscar documento
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
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
        where: { userId: currentUserId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para eliminar este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para eliminar este documento');
      }
    }
    // Los admins pueden eliminar cualquier documento

    try {
      // Obtener el publicId de Cloudinary desde los metadatos o migrar si es necesario
      let cloudinaryPublicId = (document.metadata as any)?.cloudinaryPublicId;
      
      if (!cloudinaryPublicId) {
        // El documento no tiene metadatos de Cloudinary, intentar migrarlo
        this.logger.log(`Documento ${documentId} no tiene metadatos de Cloudinary, intentando migración...`);
        cloudinaryPublicId = await this.migrateDocumentToCloudinary(document);
      }
      
      // Intentar eliminar archivo de Cloudinary (puede no existir)
      try {
        await this.cloudinaryStorage.deleteFile(cloudinaryPublicId);
        this.logger.log(`Archivo eliminado de Cloudinary: ${cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        // Si el archivo no existe en Cloudinary, solo loguear la advertencia
        if (cloudinaryError instanceof Error && cloudinaryError.message.includes('not found')) {
          this.logger.warn(`Archivo no encontrado en Cloudinary: ${cloudinaryPublicId} - continuando con eliminación de BD`);
        } else {
          this.logger.warn(`Error eliminando archivo de Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)} - continuando con eliminación de BD`);
        }
      }

      // Eliminar registro de base de datos
      await this.prisma.document.delete({
        where: { id: documentId }
      });

      this.logger.log(`Documento eliminado de base de datos: ${documentId}`);

      return { message: 'Documento eliminado exitosamente' };

    } catch (error) {
      this.logger.error(`Error eliminando documento: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadRequestException(`Error eliminando documento: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findMyDocuments(currentUserId: string, userRole: string) {
    if (userRole === 'ADMIN') {
      // Admin ve todos los documentos
      return this.prisma.document.findMany({
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
              }
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    } else if (userRole === 'ABOGADO') {
      // Abogado ve documentos de expedientes donde es el abogado asignado
      return this.prisma.document.findMany({
        where: {
          expediente: {
            lawyerId: currentUserId
          }
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
              }
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    } else if (userRole === 'CLIENTE') {
      // Cliente ve documentos de expedientes donde es el cliente
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      if (!client) {
        throw new ForbiddenException('Cliente no encontrado');
      }

      return this.prisma.document.findMany({
        where: {
          expediente: {
            clientId: client.id
          }
        },
        include: {
          expediente: {
            include: {
              client: true,
              lawyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          },
          uploadedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc'
        }
      });
    }

    throw new ForbiddenException('Rol de usuario no válido');
  }

  async findAll(currentUserId: string, userRole: string) {
    return this.findMyDocuments(currentUserId, userRole);
  }

  async getDocumentsStats(currentUserId: string, userRole: string) {
    const documents = await this.findMyDocuments(currentUserId, userRole);
    
    const totalDocuments = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const documentsByType = documents.reduce((acc, doc) => {
      const type = doc.mimeType.split('/')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalDocuments,
      totalSize,
      documentsByType,
      averageSize: totalDocuments > 0 ? totalSize / totalDocuments : 0
    };
  }

  async findByExpediente(expedienteId: string, currentUserId: string, userRole: string) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id: expedienteId },
      include: {
        client: true,
        lawyer: true,
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
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver documentos de este expediente');
      }
    }

    return this.prisma.document.findMany({
      where: { expedienteId },
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
            }
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });
  }

  async findOne(id: string, currentUserId: string, userRole: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
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
        where: { userId: currentUserId }
      });
      
      if (!client || document.expediente.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    } else if (userRole === 'ABOGADO') {
      if (document.expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver este documento');
      }
    }

    return document;
  }

  async remove(id: string, currentUserId: string, userRole: string) {
    return this.deleteDocument(id, currentUserId, userRole);
  }

  getFilePath(filename: string): string {
    // Para Cloudinary, devolvemos la URL directa
    return `/api/documents/file/${filename}`;
  }

  async getFileStream(filename: string) {
    // Para Cloudinary, devolvemos un stream desde la URL
    // Primero necesitamos encontrar el documento y obtener su publicId correcto
    const document = await this.prisma.document.findFirst({
      where: { filename },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Obtener el publicId de Cloudinary
    let cloudinaryPublicId = (document.metadata as any)?.cloudinaryPublicId;
    
    if (!cloudinaryPublicId) {
      // Si no hay metadatos, extraer el publicId del filename
      // El filename tiene formato: timestamp-randomId.extension
      // Necesitamos extraer solo la parte: timestamp-randomId
      const filenameParts = filename.split('.');
      if (filenameParts.length > 1) {
        // Quitar la extensión del final
        cloudinaryPublicId = filenameParts.slice(0, -1).join('.');
      } else {
        // Si no hay extensión, usar el filename completo
        cloudinaryPublicId = filename;
      }
      
      this.logger.log(`PublicId extraído del filename: ${filename} -> ${cloudinaryPublicId}`);
    }
    
    // Verificar que el archivo existe en Cloudinary
    try {
      await this.cloudinaryStorage.getFileMetadata(cloudinaryPublicId);
      
      // Actualizar metadatos en la base de datos para futuras consultas
      await this.prisma.document.update({
        where: { id: document.id },
        data: {
          metadata: {
            cloudinaryPublicId: cloudinaryPublicId,
            storageType: 'cloudinary',
            cloudinaryUrl: document.fileUrl,
            updatedAt: new Date().toISOString()
          } as any
        }
      });
      
      this.logger.log(`Metadatos de Cloudinary actualizados para documento ${document.id}`);
      
    } catch (cloudinaryError) {
      this.logger.error(`Error verificando archivo en Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`);
      
      // Si no se puede verificar en Cloudinary, intentar con el filename original
      // Esto puede pasar si el archivo fue subido con un nombre diferente
      try {
        const alternativePublicId = filename;
        await this.cloudinaryStorage.getFileMetadata(alternativePublicId);
        
        this.logger.log(`Archivo encontrado con filename alternativo: ${alternativePublicId}`);
        
        // Actualizar metadatos
        await this.prisma.document.update({
          where: { id: document.id },
          data: {
            metadata: {
              cloudinaryPublicId: alternativePublicId,
              storageType: 'cloudinary',
              cloudinaryUrl: document.fileUrl,
              updatedAt: new Date().toISOString()
            } as any
          }
        });
        
        cloudinaryPublicId = alternativePublicId;
        
      } catch (alternativeError) {
        this.logger.error(`Error con filename alternativo: ${alternativeError instanceof Error ? alternativeError.message : String(alternativeError)}`);
        throw new NotFoundException('El archivo no existe en Cloudinary');
      }
    }
    
    return this.cloudinaryStorage.downloadFile(cloudinaryPublicId);
  }

  async checkFileAccess(filename: string, currentUserId: string, userRole: string) {
    const document = await this.prisma.document.findFirst({
      where: { filename },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });

    if (!document) {
      return false;
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      return client && document.expediente.clientId === client.id;
    } else if (userRole === 'ABOGADO') {
      return document.expediente.lawyerId === currentUserId;
    } else if (userRole === 'ADMIN') {
      return true;
    }

    return false;
  }

  async findDocumentByFilename(filename: string) {
    return this.prisma.document.findFirst({
      where: { filename },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });
  }

  async findDocumentById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });
  }

  async checkDocumentAccess(documentId: string, currentUserId: string, userRole: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });

    if (!document) {
      return false;
    }

    // Verificar permisos
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });
      
      return client && document.expediente.clientId === client.id;
    } else if (userRole === 'ABOGADO') {
      return document.expediente.lawyerId === currentUserId;
    } else if (userRole === 'ADMIN') {
      return true;
    }

    return false;
  }

  async getDocumentStream(documentId: string) {
    // Obtener el documento por ID
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        expediente: {
          include: {
            client: true,
            lawyer: true,
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Obtener el publicId de Cloudinary
    let cloudinaryPublicId = (document.metadata as any)?.cloudinaryPublicId;
    
    if (!cloudinaryPublicId) {
      // Si no hay metadatos, asumir que filename es el publicId de Cloudinary
      // Esto es el caso cuando se sube un documento nuevo
      cloudinaryPublicId = document.filename;
      
      // Verificar que el archivo existe en Cloudinary
      try {
        await this.cloudinaryStorage.getFileMetadata(cloudinaryPublicId);
        
        // Actualizar metadatos en la base de datos para futuras consultas
        await this.prisma.document.update({
          where: { id: document.id },
          data: {
            metadata: {
              cloudinaryPublicId: cloudinaryPublicId,
              storageType: 'cloudinary',
              cloudinaryUrl: document.fileUrl,
              updatedAt: new Date().toISOString()
            } as any
          }
        });
        
        this.logger.log(`Metadatos de Cloudinary actualizados para documento ${document.id}`);
        
      } catch (cloudinaryError) {
        this.logger.error(`Error verificando archivo en Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`);
        throw new NotFoundException('El archivo no existe en Cloudinary');
      }
    }
    
    return this.cloudinaryStorage.downloadFile(cloudinaryPublicId);
  }

  async getStorageStats() {
    try {
      const cloudinaryStats = await this.cloudinaryStorage.getUsageStats();
      const freePlanInfo = this.cloudinaryStorage.getFreePlanInfo();
      
      return {
        cloudinary: {
          available: this.cloudinaryStorage.isAvailable(),
          stats: cloudinaryStats,
          freePlan: freePlanInfo
        },
        database: {
          totalDocuments: await this.prisma.document.count(),
          totalSize: await this.getTotalDatabaseSize()
        }
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas: ${error instanceof Error ? error.message : String(error)}`);
      return {
        error: 'No se pudieron obtener estadísticas',
        cloudinary: {
          available: this.cloudinaryStorage.isAvailable()
        }
      };
    }
  }

  private async getTotalDatabaseSize() {
    const result = await this.prisma.document.aggregate({
      _sum: {
        fileSize: true
      }
    });
    
    return result._sum.fileSize || 0;
  }

  private validateFile(file: any) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(`El archivo es demasiado grande. Tamaño máximo: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  /**
   * Migra un documento existente para que use metadatos de Cloudinary
   */
  private async migrateDocumentToCloudinary(document: any): Promise<string> {
    try {
      this.logger.log(`Migrando documento ${document.id} a metadatos de Cloudinary`);
      
      // Si el filename ya es un publicId de Cloudinary (no empieza con /uploads/)
      if (document.filename && !document.filename.startsWith('/uploads/') && !document.filename.startsWith('uploads/')) {
        // Asumir que filename es el publicId de Cloudinary
        const cloudinaryPublicId = document.filename;
        
        // Verificar que el archivo existe en Cloudinary
        try {
          await this.cloudinaryStorage.getFileMetadata(cloudinaryPublicId);
          
          // Actualizar metadatos en la base de datos
          await this.prisma.document.update({
            where: { id: document.id },
            data: {
              metadata: {
                cloudinaryPublicId: cloudinaryPublicId,
                storageType: 'cloudinary',
                cloudinaryUrl: document.fileUrl,
                migratedAt: new Date().toISOString()
              } as any
            }
          });
          
          this.logger.log(`Documento ${document.id} migrado exitosamente a Cloudinary`);
          return cloudinaryPublicId;
          
        } catch (cloudinaryError) {
          this.logger.error(`Error verificando archivo en Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : String(cloudinaryError)}`);
          throw new NotFoundException('El archivo no existe en Cloudinary');
        }
      } else {
        // El documento tiene una ruta local que ya no existe
        throw new NotFoundException('El archivo local ya no está disponible');
      }
      
    } catch (error) {
      this.logger.error(`Error migrando documento: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
