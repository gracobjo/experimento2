import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Status } from '@prisma/client';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) { }

  async create(createCaseDto: CreateCaseDto, currentUserId: string) {
    // Verificar que el usuario actual sea el abogado asignado o un admin
    if (createCaseDto.lawyerId !== currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId }
      });

      if (currentUser?.role !== 'ADMIN') {
        throw new ForbiddenException('Solo puedes crear expedientes para ti mismo o ser admin');
      }
    }

    // Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: createCaseDto.clientId }
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar que el abogado existe y es un abogado
    const lawyer = await this.prisma.user.findUnique({
      where: { id: createCaseDto.lawyerId }
    });

    if (!lawyer) {
      throw new NotFoundException('Abogado no encontrado');
    }

    if (lawyer.role !== 'ABOGADO') {
      throw new BadRequestException('El usuario asignado debe ser un abogado');
    }

    return this.prisma.expediente.create({
      data: {
        title: createCaseDto.title,
        description: createCaseDto.description,
        status: Status.ABIERTO,
        clientId: createCaseDto.clientId,
        lawyerId: createCaseDto.lawyerId,
      },
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
        documents: true,
      },
    });
  }

  async findMyCases(currentUserId: string, userRole: string) {
    console.log(`🔍 CasesService.findMyCases - currentUserId: ${currentUserId}, userRole: ${userRole}`);
    
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      console.log(`👤 Buscando perfil de cliente para userId: ${currentUserId}`);
      
      // Clientes solo ven sus propios expedientes
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      console.log(`📋 Perfil de cliente encontrado:`, client);

      if (!client) {
        console.log(`❌ No se encontró perfil de cliente para userId: ${currentUserId}`);
        throw new NotFoundException('Cliente no encontrado');
      }

      whereClause = { clientId: client.id };
      console.log(`🔍 Filtro aplicado: clientId = ${client.id}`);
      
    } else if (userRole === 'ABOGADO') {
      // Abogados ven expedientes donde son el abogado asignado
      whereClause = { lawyerId: currentUserId };
      console.log(`👨‍💼 Filtro aplicado: lawyerId = ${currentUserId}`);
      
    } else if (userRole === 'ADMIN') {
      // Admins ven todos los expedientes
      console.log(`👑 Admin - sin filtro aplicado`);
    }

    console.log(`🔍 Consulta final:`, whereClause);

    return this.prisma.expediente.findMany({
      where: whereClause,
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
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 5
        },
        _count: {
          select: {
            documents: true,
            tasks: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findAll(currentUserId: string, userRole: string) {
    console.log(`🔍 CasesService.findAll - currentUserId: ${currentUserId}, userRole: ${userRole}`);
    
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      console.log(`👤 Buscando perfil de cliente para userId: ${currentUserId}`);
      
      // Clientes solo ven sus propios expedientes
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      console.log(`📋 Perfil de cliente encontrado:`, client);

      if (!client) {
        console.log(`❌ No se encontró perfil de cliente para userId: ${currentUserId}`);
        throw new NotFoundException('Cliente no encontrado');
      }

      whereClause = { clientId: client.id };
      console.log(`🔍 Filtro aplicado: clientId = ${client.id}`);
      
      // Verificar que existen expedientes con ese clientId
      const expedientesCount = await this.prisma.expediente.count({
        where: { clientId: client.id }
      });
      console.log(`🔍 Total de expedientes con clientId ${client.id}: ${expedientesCount}`);
      
    } else if (userRole === 'ABOGADO') {
      // Abogados ven expedientes asignados a ellos
      whereClause = { lawyerId: currentUserId };
      console.log(`🔍 Filtro aplicado: lawyerId = ${currentUserId}`);
    }
    // Los admins ven todos los expedientes (whereClause vacío)

    console.log(`🔍 Where clause final:`, whereClause);

    const expedientes = await this.prisma.expediente.findMany({
      where: whereClause,
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
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Log solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Expedientes encontrados: ${expedientes.length}`);
    }

    return expedientes;
  }


  async findAllold(currentUserId: string, userRole: string) {
    console.log(`Buscando casos para ${userRole} con ID ${currentUserId}`); // Log de depuración

    let whereClause = {};

    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      if (!client) throw new NotFoundException('Cliente no encontrado');

      whereClause = { clientId: client.id };
    } else if (userRole === 'ABOGADO') {
      whereClause = { lawyerId: currentUserId };
    }
    // else: ADMIN no necesita whereClause

    const casos = await this.prisma.expediente.findMany({
      where: whereClause,
      include: { /* ... */ },
    });

    console.log(`Encontrados ${casos.length} casos para ${userRole}`); // Log de resultados
    return casos;
  }

  async findOne(id: string, currentUserId: string, userRole: string) {
    const expediente = await this.prisma.expediente.findUnique({
      where: { id },
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
        documents: {
          orderBy: {
            uploadedAt: 'desc'
          }
        },
      },
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
        throw new ForbiddenException('No tienes permisos para ver este expediente');
      }
    } else if (userRole === 'ABOGADO') {
      if (expediente.lawyerId !== currentUserId) {
        throw new ForbiddenException('No tienes permisos para ver este expediente');
      }
    }
    // Los admins pueden ver cualquier expediente

    return expediente;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, currentUserId: string, userRole: string) {
    // Verificar que el expediente existe
    const existingCase = await this.prisma.expediente.findUnique({
      where: { id },
      include: {
        lawyer: true,
      }
    });

    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (existingCase.lawyerId !== currentUserId) {
        throw new ForbiddenException('Solo puedes editar expedientes asignados a ti');
      }
    } else if (userRole === 'CLIENTE') {
      throw new ForbiddenException('Los clientes no pueden editar expedientes');
    }
    // Los admins pueden editar cualquier expediente

    // Si se está cambiando el abogado, verificar que el nuevo abogado existe y es un abogado
    if (updateCaseDto.lawyerId) {
      const newLawyer = await this.prisma.user.findUnique({
        where: { id: updateCaseDto.lawyerId }
      });

      if (!newLawyer) {
        throw new NotFoundException('Abogado no encontrado');
      }

      if (newLawyer.role !== 'ABOGADO') {
        throw new BadRequestException('El usuario asignado debe ser un abogado');
      }
    }

    const { title, description, status, lawyerId, clientId } = updateCaseDto;
    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status as Status;
    if (lawyerId !== undefined) data.lawyerId = lawyerId;
    if (clientId !== undefined) data.clientId = clientId;
    return this.prisma.expediente.update({
      where: { id },
      data,
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
        documents: true,
      },
    });
  }

  async remove(id: string, currentUserId: string, userRole: string) {
    // Verificar que el expediente existe
    const existingCase = await this.prisma.expediente.findUnique({
      where: { id },
      include: {
        lawyer: true,
      }
    });

    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Solo los admins pueden eliminar expedientes
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Solo los administradores pueden eliminar expedientes');
    }

    // Eliminar documentos asociados primero
    await this.prisma.document.deleteMany({
      where: { expedienteId: id }
    });

    return this.prisma.expediente.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: Status, currentUserId: string, userRole: string) {
    // Verificar que el expediente existe
    const existingCase = await this.prisma.expediente.findUnique({
      where: { id },
      include: {
        lawyer: true,
      }
    });

    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // Verificar permisos
    if (userRole === 'ABOGADO') {
      if (existingCase.lawyerId !== currentUserId) {
        throw new ForbiddenException('Solo puedes cambiar el estado de expedientes asignados a ti');
      }
    } else if (userRole === 'CLIENTE') {
      throw new ForbiddenException('Los clientes no pueden cambiar el estado de expedientes');
    }
    // Los admins pueden cambiar cualquier estado

    return this.prisma.expediente.update({
      where: { id },
      data: { status },
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
        documents: true,
      },
    });
  }

  async getCasesByStatus(status: Status, currentUserId: string, userRole: string) {
    let whereClause: any = { status };

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      whereClause.clientId = client.id;
    } else if (userRole === 'ABOGADO') {
      whereClause.lawyerId = currentUserId;
    }
    // Los admins ven todos los expedientes con ese estado

    return this.prisma.expediente.findMany({
      where: whereClause,
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
        documents: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
  }

  async getCasesStats(currentUserId: string, userRole: string) {
    console.log('[CASES_STATS] Iniciando estadísticas para usuario:', currentUserId, 'rol:', userRole);
    
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      whereClause = { clientId: client.id };
      console.log('[CASES_STATS] Cliente encontrado, clientId:', client.id);
    } else if (userRole === 'ABOGADO') {
      whereClause = { lawyerId: currentUserId };
      console.log('[CASES_STATS] Abogado, lawyerId:', currentUserId);
    }
    // Los admins ven todas las estadísticas (whereClause vacío)

    console.log('[CASES_STATS] Where clause:', JSON.stringify(whereClause));

    const [total, abiertos, enProceso, cerrados] = await Promise.all([
      this.prisma.expediente.count({ where: whereClause }),
      this.prisma.expediente.count({ where: { ...whereClause, status: Status.ABIERTO } }),
      this.prisma.expediente.count({ where: { ...whereClause, status: Status.EN_PROCESO } }),
      this.prisma.expediente.count({ where: { ...whereClause, status: Status.CERRADO } }),
    ]);

    console.log('[CASES_STATS] Resultados:', { total, abiertos, enProceso, cerrados });

    // Verificar si hay casos para este usuario
    const allCases = await this.prisma.expediente.findMany({
      where: whereClause,
      select: { id: true, title: true, status: true, lawyerId: true, clientId: true }
    });
    console.log('[CASES_STATS] Todos los casos encontrados:', allCases);

    return {
      total,
      abiertos,
      enProceso,
      cerrados,
      byStatus: {
        ABIERTO: abiertos,
        EN_PROCESO: enProceso,
        CERRADO: cerrados,
      }
    };
  }

  async debugAllCases() {
    console.log('[DEBUG_CASES_SERVICE] Obteniendo todos los casos...');
    
    try {
      const allCases = await this.prisma.expediente.findMany({
        include: {
          lawyer: {
            select: { id: true, name: true, email: true }
          },
          client: {
            select: { id: true, user: { select: { id: true, name: true, email: true } } }
          }
        }
      });
      
      console.log('[DEBUG_CASES_SERVICE] Total de casos encontrados:', allCases.length);
      
      return allCases;
    } catch (error) {
      console.error('[DEBUG_CASES_SERVICE] Error:', error);
      throw error;
    }
  }

  async getRecentCases(currentUserId: string, userRole: string) {
    let whereClause = {};

    // Filtrar por rol del usuario
    if (userRole === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: currentUserId }
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      whereClause = { clientId: client.id };
    } else if (userRole === 'ABOGADO') {
      whereClause = { lawyerId: currentUserId };
    }
    // Los admins ven todos los casos recientes (whereClause vacío)

    return this.prisma.expediente.findMany({
      where: whereClause,
      take: 5, // Solo los 5 más recientes
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
      },
      orderBy: {
        createdAt: 'desc'
      },
    });
  }

  async getRecentActivities(lawyerId: string) {
    // Obtener expedientes recientes del abogado
    const recentCases = await this.prisma.expediente.findMany({
      where: { lawyerId },
      take: 3,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Obtener tareas recientes asignadas al abogado
    const recentTasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { assignedTo: lawyerId },
          { createdBy: lawyerId }
        ]
      },
      take: 3,
      include: {
        expediente: {
          select: {
            id: true,
            title: true,
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    // Obtener citas recientes del abogado
    const recentAppointments = await this.prisma.appointment.findMany({
      where: { lawyerId },
      take: 3,
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
      },
      orderBy: {
        date: 'desc'
      },
    });

    // Obtener provisiones de fondos recientes de los expedientes del abogado
    const recentProvisions = await this.prisma.provisionFondos.findMany({
      where: {
        expediente: {
          lawyerId: lawyerId
        }
      },
      take: 3,
      include: {
        expediente: {
          select: {
            id: true,
            title: true,
          }
        },
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
      },
      orderBy: {
        createdAt: 'desc'
      },
    });

    return {
      cases: recentCases,
      tasks: recentTasks,
      appointments: recentAppointments,
      provisions: recentProvisions,
    };
  }

  async findByClientId(clientId: string) {
    return this.prisma.expediente.findMany({
      where: { clientId },
      include: {
        client: { include: { user: true } },
        lawyer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createForClient(clientId: string, createCaseDto: CreateCaseDto, userId: string) {
    const { title, description, status } = createCaseDto;
    return this.prisma.expediente.create({
      data: {
        title,
        description,
        status: status as Status,
        clientId,
        lawyerId: userId,
      },
    });
  }

  async updateForClient(clientId: string, caseId: string, updateCaseDto: UpdateCaseDto, userId: string) {
    const expediente = await this.prisma.expediente.findFirst({ where: { id: caseId, clientId } });
    if (!expediente) throw new Error('Caso no encontrado para este cliente');
    const { title, description, status } = updateCaseDto;
    return this.prisma.expediente.update({
      where: { id: caseId },
      data: {
        title,
        description,
        status: status as Status,
      },
    });
  }

  async patchForClient(clientId: string, caseId: string, updateCaseDto: UpdateCaseDto, userId: string) {
    return this.updateForClient(clientId, caseId, updateCaseDto, userId);
  }

  async deleteForClient(clientId: string, caseId: string, userId: string) {
    const expediente = await this.prisma.expediente.findFirst({ where: { id: caseId, clientId } });
    if (!expediente) throw new Error('Caso no encontrado para este cliente');
    await this.prisma.expediente.delete({ where: { id: caseId } });
    return { message: 'Caso eliminado exitosamente' };
  }
} 