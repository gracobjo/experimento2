import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Crear nueva conversación del chatbot
  async createConversation(data: {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userPhone?: string;
    conversationType: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: any;
  }) {
    try {
      const conversation = await this.prisma.chatbotConversation.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          userEmail: data.userEmail,
          userPhone: data.userPhone,
          conversationType: data.conversationType,
          userAgent: data.userAgent,
          ipAddress: data.ipAddress,
          metadata: data.metadata,
        },
      });

      this.logger.log(`Nueva conversación creada: ${conversation.id}`);
      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error creando conversación: ${errorMessage}`);
      throw error;
    }
  }

  // Agregar mensaje a la conversación
  async addMessage(data: {
    conversationId: string;
    messageType: string;
    content: string;
    intent?: string;
    confidence?: number;
    entities?: any;
    sentiment?: string;
    processingTime?: number;
    error?: string;
  }) {
    try {
      const message = await this.prisma.chatbotMessageDetail.create({
        data: {
          conversationId: data.conversationId,
          messageType: data.messageType,
          content: data.content,
          intent: data.intent,
          confidence: data.confidence,
          entities: data.entities,
          sentiment: data.sentiment,
          processingTime: data.processingTime,
          error: data.error,
        },
      });

      // Actualizar contadores de la conversación
      await this.updateConversationCounters(data.conversationId);

      return message;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error agregando mensaje: ${errorMessage}`);
      throw error;
    }
  }

  // Actualizar contadores de la conversación
  private async updateConversationCounters(conversationId: string) {
    try {
      const conversation = await this.prisma.chatbotConversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
      });

      if (conversation) {
        const totalMessages = conversation.messages.length;
        const userMessages = conversation.messages.filter(
          (m) => m.messageType === 'user_input',
        ).length;
        const botMessages = conversation.messages.filter(
          (m) => m.messageType === 'bot_response',
        ).length;

        await this.prisma.chatbotConversation.update({
          where: { id: conversationId },
          data: {
            totalMessages,
            userMessages,
            botMessages,
            lastActivity: new Date(),
          },
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error actualizando contadores: ${errorMessage}`);
    }
  }

  // Completar conversación
  async completeConversation(conversationId: string, appointmentId?: string) {
    try {
      const conversation = await this.prisma.chatbotConversation.update({
        where: { id: conversationId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          appointment: appointmentId ? { connect: { id: appointmentId } } : undefined,
        },
      });

      this.logger.log(`Conversación completada: ${conversationId}`);
      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error completando conversación: ${errorMessage}`);
      throw error;
    }
  }

  // Abandonar conversación
  async abandonConversation(conversationId: string) {
    try {
      const conversation = await this.prisma.chatbotConversation.update({
        where: { id: conversationId },
        data: {
          status: 'ABANDONED',
          completedAt: new Date(),
        },
      });

      this.logger.log(`Conversación abandonada: ${conversationId}`);
      return conversation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error abandonando conversación: ${errorMessage}`);
      throw error;
    }
  }

  // Registrar envío de email
  async logEmail(data: {
    recipient: string;
    subject: string;
    template: string;
    appointmentId?: string;
    userId?: string;
    metadata?: any;
  }) {
    try {
      const emailLog = await this.prisma.emailLog.create({
        data: {
          recipient: data.recipient,
          subject: data.subject,
          template: data.template,
          status: 'SENT',
          appointmentId: data.appointmentId,
          userId: data.userId,
          metadata: data.metadata,
        },
      });

      this.logger.log(`Email log creado: ${emailLog.id}`);
      return emailLog;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error creando email log: ${errorMessage}`);
      throw error;
    }
  }

  // Actualizar estado del email
  async updateEmailStatus(emailLogId: string, status: string, additionalData?: any) {
    try {
      const updateData: any = { status };
      
      if (status === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      } else if (status === 'FAILED') {
        updateData.failedAt = new Date();
        updateData.error = additionalData?.error;
        updateData.retryCount = { increment: 1 };
      }

      if (additionalData?.messageId) {
        updateData.messageId = additionalData.messageId;
      }

      const emailLog = await this.prisma.emailLog.update({
        where: { id: emailLogId },
        data: updateData,
      });

      this.logger.log(`Email log actualizado: ${emailLogId} - ${status}`);
      return emailLog;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error actualizando email log: ${errorMessage}`);
      throw error;
    }
  }

  // Obtener estadísticas del chatbot
  async getChatbotAnalytics(dateRange?: { start: Date; end: Date }) {
    try {
      const whereClause = dateRange
        ? {
            startedAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          }
        : {};

      const [
        totalConversations,
        completedConversations,
        abandonedConversations,
        totalMessages,
        appointmentBookings,
        emailLogs,
      ] = await Promise.all([
        this.prisma.chatbotConversation.count({ where: whereClause }),
        this.prisma.chatbotConversation.count({
          where: { ...whereClause, status: 'COMPLETED' },
        }),
        this.prisma.chatbotConversation.count({
          where: { ...whereClause, status: 'ABANDONED' },
        }),
        this.prisma.chatbotMessageDetail.count({ 
          where: dateRange ? {
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          } : {}
        }),
        this.prisma.visitorAppointment.count({ 
          where: dateRange ? {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          } : {}
        }),
        this.prisma.emailLog.count({ 
          where: dateRange ? {
            sentAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          } : {}
        }),
      ]);

      // Calcular métricas
      const conversionRate = totalConversations > 0 
        ? (appointmentBookings / totalConversations) * 100 
        : 0;

      const averageMessagesPerConversation = totalConversations > 0 
        ? totalMessages / totalConversations 
        : 0;

      // Obtener intenciones más comunes
      const topIntents = await this.prisma.chatbotMessageDetail.groupBy({
        by: ['intent'],
        where: { 
          ...(dateRange ? {
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          } : {}),
          intent: { not: null } 
        },
        _count: { intent: true },
        orderBy: { _count: { intent: 'desc' } },
        take: 10,
      });

      // Obtener distribución por idiomas
      const languageDistribution = await this.prisma.chatbotConversation.groupBy({
        by: ['language'],
        where: whereClause,
        _count: { language: true },
      });

      return {
        totalConversations,
        completedConversations,
        abandonedConversations,
        totalMessages,
        appointmentBookings,
        emailLogs,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageMessagesPerConversation: Math.round(averageMessagesPerConversation * 100) / 100,
        topIntents: topIntents.map(item => ({
          intent: item.intent,
          count: item._count.intent,
        })),
        languageDistribution: languageDistribution.map(item => ({
          language: item.language,
          count: item._count.language,
        })),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error obteniendo analytics: ${errorMessage}`);
      throw error;
    }
  }

  // Obtener conversaciones recientes
  async getRecentConversations(limit: number = 20) {
    try {
      const conversations = await this.prisma.chatbotConversation.findMany({
        take: limit,
        orderBy: { lastActivity: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 5, // Últimos 5 mensajes
          },
          appointment: {
            select: {
              id: true,
              fullName: true,
              consultationReason: true,
              status: true,
            },
          },
        },
      });

      return conversations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error obteniendo conversaciones: ${errorMessage}`);
      throw error;
    }
  }

  // Obtener logs de emails recientes
  async getRecentEmailLogs(limit: number = 20) {
    try {
      const emailLogs = await this.prisma.emailLog.findMany({
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: {
          appointment: {
            select: {
              id: true,
              fullName: true,
              consultationReason: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return emailLogs;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error obteniendo email logs: ${errorMessage}`);
      throw error;
    }
  }
}
