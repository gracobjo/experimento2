import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogData {
  invoiceId: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'status_changed';
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class InvoiceAuditService {
  constructor(private prisma: PrismaService) {}

  async logAuditEvent(data: AuditLogData) {
    try {
      await this.prisma.invoiceAuditHistory.create({
        data: {
          invoiceId: data.invoiceId,
          userId: data.userId,
          action: data.action,
          fieldName: data.fieldName,
          oldValue: data.oldValue,
          newValue: data.newValue,
          description: data.description,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
      // No lanzamos el error para no interrumpir el flujo principal
    }
  }

  async getInvoiceAuditHistory(invoiceId: string) {
    return this.prisma.invoiceAuditHistory.findMany({
      where: { invoiceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async logInvoiceCreation(invoiceId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await this.logAuditEvent({
      invoiceId,
      userId,
      action: 'created',
      description: 'Factura creada',
      ipAddress,
      userAgent,
    });
  }

  async logInvoiceUpdate(
    invoiceId: string,
    userId: string,
    changes: Record<string, { oldValue: any; newValue: any }>,
    ipAddress?: string,
    userAgent?: string
  ) {
    for (const [fieldName, { oldValue, newValue }] of Object.entries(changes)) {
      await this.logAuditEvent({
        invoiceId,
        userId,
        action: 'updated',
        fieldName,
        oldValue: oldValue?.toString() || null,
        newValue: newValue?.toString() || null,
        description: `Campo '${fieldName}' actualizado`,
        ipAddress,
        userAgent,
      });
    }
  }

  async logStatusChange(
    invoiceId: string,
    userId: string,
    oldStatus: string,
    newStatus: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    await this.logAuditEvent({
      invoiceId,
      userId,
      action: 'status_changed',
      fieldName: 'estado',
      oldValue: oldStatus,
      newValue: newStatus,
      description: `Estado cambiado de '${oldStatus}' a '${newStatus}'`,
      ipAddress,
      userAgent,
    });
  }

  async logInvoiceDeletion(invoiceId: string, userId: string, ipAddress?: string, userAgent?: string) {
    await this.logAuditEvent({
      invoiceId,
      userId,
      action: 'deleted',
      description: 'Factura eliminada',
      ipAddress,
      userAgent,
    });
  }

  async getChangesSummary(invoiceId: string) {
    const auditHistory = await this.getInvoiceAuditHistory(invoiceId);
    
    const summary = {
      totalChanges: auditHistory.length,
      lastModified: auditHistory[0]?.createdAt || null,
      lastModifiedBy: auditHistory[0]?.user?.name || null,
      changesByField: {} as Record<string, number>,
      changesByUser: {} as Record<string, number>,
    };

    auditHistory.forEach(record => {
      // Contar cambios por campo
      if (record.fieldName) {
        summary.changesByField[record.fieldName] = (summary.changesByField[record.fieldName] || 0) + 1;
      }
      
      // Contar cambios por usuario
      const userName = record.user?.name || 'Usuario desconocido';
      summary.changesByUser[userName] = (summary.changesByUser[userName] || 0) + 1;
    });

    return summary;
  }
} 