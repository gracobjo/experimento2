import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('chatbot')
@Controller('chatbot')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('analytics')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener estadísticas del chatbot' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas exitosamente' })
  async getAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let dateRange;
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    return this.chatbotService.getChatbotAnalytics(dateRange);
  }

  @Get('conversations')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener conversaciones recientes del chatbot' })
  @ApiResponse({ status: 200, description: 'Conversaciones obtenidas exitosamente' })
  async getRecentConversations(@Query('limit') limit?: number) {
    return this.chatbotService.getRecentConversations(limit || 20);
  }

  @Get('conversations/:id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener conversación específica del chatbot' })
  @ApiResponse({ status: 200, description: 'Conversación obtenida exitosamente' })
  async getConversation(@Param('id') id: string) {
    // Implementar método para obtener conversación específica
    return { message: 'Método a implementar' };
  }

  @Get('email-logs')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener logs de emails recientes' })
  @ApiResponse({ status: 200, description: 'Logs de emails obtenidos exitosamente' })
  async getRecentEmailLogs(@Query('limit') limit?: number) {
    return this.chatbotService.getRecentEmailLogs(limit || 20);
  }

  @Post('conversations')
  @ApiOperation({ summary: 'Crear nueva conversación del chatbot' })
  @ApiResponse({ status: 201, description: 'Conversación creada exitosamente' })
  async createConversation(@Body() data: {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    userPhone?: string;
    conversationType: string;
    userAgent?: string;
    ipAddress?: string;
    metadata?: any;
  }) {
    return this.chatbotService.createConversation(data);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Agregar mensaje a la conversación' })
  @ApiResponse({ status: 201, description: 'Mensaje agregado exitosamente' })
  async addMessage(
    @Param('id') conversationId: string,
    @Body() data: {
      messageType: string;
      content: string;
      intent?: string;
      confidence?: number;
      entities?: any;
      sentiment?: string;
      processingTime?: number;
      error?: string;
    },
  ) {
    return this.chatbotService.addMessage({
      conversationId,
      ...data,
    });
  }

  @Put('conversations/:id/complete')
  @ApiOperation({ summary: 'Completar conversación del chatbot' })
  @ApiResponse({ status: 200, description: 'Conversación completada exitosamente' })
  async completeConversation(
    @Param('id') conversationId: string,
    @Body() data: { appointmentId?: string },
  ) {
    return this.chatbotService.completeConversation(conversationId, data.appointmentId);
  }

  @Put('conversations/:id/abandon')
  @ApiOperation({ summary: 'Abandonar conversación del chatbot' })
  @ApiResponse({ status: 200, description: 'Conversación abandonada exitosamente' })
  async abandonConversation(@Param('id') conversationId: string) {
    return this.chatbotService.abandonConversation(conversationId);
  }

  @Post('email-logs')
  @ApiOperation({ summary: 'Registrar envío de email' })
  @ApiResponse({ status: 201, description: 'Email log creado exitosamente' })
  async logEmail(@Body() data: {
    recipient: string;
    subject: string;
    template: string;
    appointmentId?: string;
    userId?: string;
    metadata?: any;
  }) {
    return this.chatbotService.logEmail(data);
  }

  @Put('email-logs/:id/status')
  @ApiOperation({ summary: 'Actualizar estado del email' })
  @ApiResponse({ status: 200, description: 'Estado del email actualizado exitosamente' })
  async updateEmailStatus(
    @Param('id') emailLogId: string,
    @Body() data: { status: string; additionalData?: any },
  ) {
    return this.chatbotService.updateEmailStatus(
      emailLogId,
      data.status,
      data.additionalData,
    );
  }

  @Get('dashboard-summary')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener resumen del dashboard del chatbot' })
  @ApiResponse({ status: 200, description: 'Resumen obtenido exitosamente' })
  async getDashboardSummary() {
    const [analytics, recentConversations, recentEmailLogs] = await Promise.all([
      this.chatbotService.getChatbotAnalytics(),
      this.chatbotService.getRecentConversations(5),
      this.chatbotService.getRecentEmailLogs(5),
    ]);

    return {
      analytics,
      recentConversations,
      recentEmailLogs,
      timestamp: new Date(),
    };
  }
}
