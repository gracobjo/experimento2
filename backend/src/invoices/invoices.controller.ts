import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UsePipes, ValidationPipe, Request, HttpException, HttpStatus, Patch, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { InvoiceAuditService } from './invoice-audit.service';
import { DigitalSignatureService, SignatureRequest } from './digital-signature.service';
import * as fs from 'fs';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@ApiTags('invoices')
@Controller('invoices')
@ApiBearerAuth('JWT-auth')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly invoiceAuditService: InvoiceAuditService,
    private readonly digitalSignatureService: DigitalSignatureService
  ) {}

  @Post()
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ 
    summary: 'Crear factura',
    description: 'Crea una nueva factura electrónica (solo ABOGADO)'
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Factura creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numero: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        emisorId: { type: 'string' },
        receptorId: { type: 'string' },
        importeTotal: { type: 'number' },
        estado: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    console.log('=== INVOICE CREATE ENDPOINT CALLED ===');
    console.log('Request user:', req.user);
    console.log('CreateInvoiceDto received:', JSON.stringify(createInvoiceDto, null, 2));
    
    // Forzar que el emisorId sea el del usuario autenticado
    createInvoiceDto.emisorId = req.user.id;
    console.log('EmisorId set to:', createInvoiceDto.emisorId);
    
    try {
      const result = await this.invoicesService.create(createInvoiceDto);
      console.log('Invoice created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Invoice creation error:', error);
      console.error('Error details:', error?.response?.data || error?.message || String(error));
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Error creating invoice',
        details: error?.response?.data || error?.message || String(error),
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Obtener todas las facturas',
    description: 'Devuelve todas las facturas (ADMIN y ABOGADO)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de facturas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          numero: { type: 'string' },
          fecha: { type: 'string', format: 'date' },
          emisorId: { type: 'string' },
          receptorId: { type: 'string' },
          importeTotal: { type: 'number' },
          estado: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll(@Request() req) {
    const user = req.user;
    return this.invoicesService.findAll(user);
  }

  @Get('my')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Obtener mis facturas', description: 'Devuelve las facturas del cliente autenticado, con filtros por abogado y fecha de pago.' })
  @ApiResponse({ status: 200, description: 'Lista de facturas del cliente' })
  async getMyInvoices(@Request() req) {
    console.log('MY INVOICES ENDPOINT CALLED');
    console.log('=== getMyInvoices CALLED [DEBUG] ===');
    console.log('User ID:', req.user?.id);
    console.log('User Role:', req.user?.role);
    console.log('User Email:', req.user?.email);
    console.log('Query params:', req.query);
    
    if (!req.user) {
      console.error('No user found in request');
      throw new HttpException('No autenticado', HttpStatus.UNAUTHORIZED);
    }

    // Si es ADMIN, devolver todas las facturas
    if (req.user.role === 'ADMIN') {
      console.log('Admin user - returning all invoices');
      return this.invoicesService.findAll(req.user);
    }

    // Si es ABOGADO, devolver sus facturas emitidas
    if (req.user.role === 'ABOGADO') {
      console.log('Lawyer user - returning emitted invoices');
      return this.invoicesService.findAll(req.user);
    }

    // Si es CLIENTE, usar el endpoint específico para clientes
    if (req.user.role === 'CLIENTE') {
      console.log('Client user - using findForClient');
      const { lawyerId, paymentDate } = req.query;
      console.log('Calling findForClient with:', { clientId: req.user.id, lawyerId, paymentDate });
      
      try {
        const result = await this.invoicesService.findForClient(req.user.id, lawyerId, paymentDate);
        console.log('Client invoices found:', result.length);
        console.log('First invoice (if any):', result[0] || 'No invoices');
        return result;
      } catch (error) {
        console.error('Error in getMyInvoices for client:', error);
        throw error;
      }
    }

    console.error('Unknown role:', req.user.role);
    throw new HttpException('Rol no válido', HttpStatus.FORBIDDEN);
  }

  @Get(':id/pdf-qr')
  @Roles(Role.ABOGADO, Role.ADMIN, Role.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Descargar PDF con QR',
    description: 'Descarga el PDF de la factura con código QR'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF con QR',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getInvoicePdfWithQR(@Param('id') id: string, @Res() res: Response, @Request() req) {
    try {
      console.log('[PDF-QR] Iniciando generación de PDF para factura:', id);
      
      // Obtener la factura de la base de datos
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice) {
        console.log('[PDF-QR] Factura no encontrada');
        return res.status(404).send('Factura no encontrada');
      }

      // Verificar permisos
      if (req.user.role === 'CLIENTE' && invoice.receptorId !== req.user.id) {
        console.log('[PDF-QR] No autorizado - CLIENTE');
        return res.status(403).send('No autorizado para acceder a esta factura');
      }

      if (req.user.role === 'ABOGADO' && invoice.emisorId !== req.user.id && req.user.role !== 'ADMIN') {
        console.log('[PDF-QR] No autorizado - ABOGADO');
        return res.status(403).send('No autorizado para acceder a esta factura');
      }
      
      console.log('[PDF-QR] Permisos verificados correctamente');
      console.log('[PDF-QR] Datos de la factura:', JSON.stringify(invoice, null, 2));
      
      // Generar el PDF con QR
      console.log('[PDF-QR] Iniciando generación de PDF...');
      const pdfBuffer = await this.invoicesService.generateInvoicePdfWithQR(invoice);
      
      // Verificar que el buffer es válido
      if (!Buffer.isBuffer(pdfBuffer)) {
        console.error('[PDF-QR] Error: pdfBuffer no es un Buffer válido');
        return res.status(500).send('Error: Buffer PDF inválido');
      }
      
      console.log(`[PDF-QR] Buffer PDF generado. Tamaño: ${pdfBuffer.length} bytes`);
      console.log(`[PDF-QR] Primeros bytes: ${Array.from(pdfBuffer.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

      // Verificar que es un PDF válido (debe empezar con %PDF)
      const pdfHeader = pdfBuffer.slice(0, 4).toString('ascii');
      if (pdfHeader !== '%PDF') {
        console.error('[PDF-QR] Error: Buffer no es un PDF válido. Header:', pdfHeader);
        return res.status(500).send('Error: Buffer no es un PDF válido');
      }

      // Configurar headers y enviar respuesta
      console.log('[PDF-QR] Configurando headers de respuesta...');
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="factura_${invoice.numeroFactura || id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      // Enviar el buffer directamente sin procesamiento adicional
      console.log('[PDF-QR] Enviando PDF al cliente...');
      res.end(pdfBuffer);
      console.log('[PDF-QR] PDF enviado exitosamente');
      
    } catch (error) {
      console.error('[PDF-QR] Error al generar PDF con QR:', error);
      console.error('[PDF-QR] Stack trace:', (error as any).stack);
      res.status(500).send({ error: (error as any).message || error.toString() });
    }
  }

  @Get(':id/test-pdf')
  @Roles(Role.ABOGADO, Role.ADMIN, Role.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Test PDF simple',
    description: 'Genera un PDF de prueba simple'
  })
  async testPdf(@Param('id') id: string, @Res() res: Response, @Request() req) {
    try {
      console.log('[TEST-PDF] Generando PDF de prueba...');
      
      // Crear un PDF simple de prueba
      const { PDFDocument, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      // Configurar fuentes
      const helveticaFont = await pdfDoc.embedFont('Helvetica');
      const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');

      // Título
      page.drawText('TEST PDF', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBoldFont,
        color: rgb(0, 0.2, 0.4)
      });

      // Información de prueba
      page.drawText(`Factura ID: ${id}`, {
        x: 50,
        y: height - 100,
        size: 14,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText(`Usuario: ${req.user.name}`, {
        x: 50,
        y: height - 120,
        size: 14,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      page.drawText(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, {
        x: 50,
        y: height - 140,
        size: 14,
        font: helveticaFont,
        color: rgb(0.2, 0.2, 0.2)
      });

      // Generar el PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);
      
      console.log(`[TEST-PDF] PDF generado. Tamaño: ${pdfBuffer.length} bytes`);
      console.log(`[TEST-PDF] Header: ${pdfBuffer.slice(0, 4).toString('ascii')}`);

      // Configurar headers y enviar respuesta
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="test_${id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      
      res.end(pdfBuffer);
      console.log('[TEST-PDF] PDF enviado exitosamente');
      
    } catch (error) {
      console.error('[TEST-PDF] Error:', error);
      res.status(500).send({ error: (error as any).message || error.toString() });
    }
  }

  @Get(':id')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Obtener factura por ID',
    description: 'Devuelve una factura específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numero: { type: 'string' },
        fecha: { type: 'string', format: 'date' },
        emisorId: { type: 'string' },
        receptorId: { type: 'string' },
        importeTotal: { type: 'number' },
        estado: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ABOGADO, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar factura', description: 'Permite editar una factura y auditar los cambios.' })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura actualizada exitosamente con auditoría automática',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        numeroFactura: { type: 'string' },
        fechaFactura: { type: 'string', format: 'date' },
        importeTotal: { type: 'number' },
        baseImponible: { type: 'number' },
        cuotaIVA: { type: 'number' },
        estado: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitPrice: { type: 'number' },
              total: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req
  ) {
    console.log('=== INVOICE UPDATE ENDPOINT CALLED ===');
    console.log('Invoice ID:', id);
    console.log('Request user:', req.user);
    console.log('UpdateInvoiceDto received:', JSON.stringify(updateInvoiceDto, null, 2));
    
    const userId = req.user?.id;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    
    try {
      const result = await this.invoicesService.update(id, updateInvoiceDto, userId, ipAddress, userAgent);
      console.log('Invoice updated successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Invoice update error:', error);
      console.error('Error details:', error?.response?.data || error?.message || String(error));
      throw error;
    }
  }

  @Delete(':id')
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Eliminar factura',
    description: 'Elimina una factura del sistema (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura eliminada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Factura eliminada exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async remove(@Param('id') id: string, @Request() req) {
    try {
      console.log('[DELETE] Iniciando eliminación de factura:', id);
      console.log('[DELETE] Usuario:', req.user.id, req.user.role);
      
      // Verificar que la factura existe y pertenece al usuario
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice) {
        console.log('[DELETE] Factura no encontrada:', id);
        throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
      }
      
      // Verificar permisos
      if (req.user.role !== 'ADMIN' && invoice.emisorId !== req.user.id) {
        console.log('[DELETE] No autorizado para eliminar factura:', id);
        throw new HttpException('No autorizado para eliminar esta factura', HttpStatus.FORBIDDEN);
      }
      
      console.log('[DELETE] Permisos verificados, eliminando factura:', id);
      const result = await this.invoicesService.remove(id);
      console.log('[DELETE] Factura eliminada exitosamente:', id);
      
      return result;
    } catch (error) {
      console.error('[DELETE] Error eliminando factura:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('No se puede eliminar')) {
        throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
      }
      
      if (errorMessage.includes('no encontrada')) {
        throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
      }
      
      throw new HttpException(
        'Error interno del servidor al eliminar la factura', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(':id/sign')
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Firmar factura',
    description: 'Firma digitalmente una factura (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certPath: { type: 'string', description: 'Ruta al certificado (opcional)' },
        keyPath: { type: 'string', description: 'Ruta a la clave privada (opcional)' },
        certContent: { type: 'string', description: 'Contenido del certificado (opcional)' },
        keyContent: { type: 'string', description: 'Contenido de la clave privada (opcional)' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura firmada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        signedXml: { type: 'string' },
        signatureValid: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async sign(@Param('id') id: string, @Body() body: { certPath?: string; keyPath?: string; certContent?: string; keyContent?: string }) {
    // Si se recibe el contenido, usarlo; si no, usar rutas o variables de entorno
    const certContent = body.certContent;
    const keyContent = body.keyContent;
    const certPath = body.certPath || process.env.FACTURAE_CERT_PATH;
    const keyPath = body.keyPath || process.env.FACTURAE_KEY_PATH;
    return this.invoicesService.sign(id, certPath, keyPath, certContent, keyContent);
  }

  @Post('generate-xml')
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Generar XML de facturas',
    description: 'Genera XML para múltiples facturas (solo ABOGADO)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array de IDs de facturas'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'XML generado exitosamente',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string' },
        facturas: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async generateXml(@Body() body: { ids: string[] }, @Request() req) {
    // Validar que el usuario es el emisor de cada factura
    return this.invoicesService.generateXmlForInvoices(body.ids, req.user.id);
  }

  @Post('upload-signed')
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Subir factura firmada',
    description: 'Sube una factura ya firmada (solo ABOGADO)'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID de la factura' },
        signedXml: { type: 'string', description: 'XML firmado de la factura' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura firmada guardada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        signedXml: { type: 'string' },
        signatureValid: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async uploadSigned(@Body() body: { id: string; signedXml: string }, @Request() req) {
    // Validar que el usuario es el emisor de la factura
    return this.invoicesService.saveSignedXml(body.id, body.signedXml, req.user.id);
  }

  @Patch(':id/anular')
  @Roles(Role.CLIENTE, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Anular factura',
    description: 'Anula una factura con motivo (solo ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivoAnulacion: { 
          type: 'string', 
          description: 'Motivo de la anulación (mínimo 3 caracteres)',
          minLength: 3
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Factura anulada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        estado: { type: 'string', example: 'ANULADA' },
        motivoAnulacion: { type: 'string' },
        fechaAnulacion: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Motivo de anulación inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async annul(@Param('id') id: string, @Body() body: { motivoAnulacion: string }, @Request() req) {
    if (!body.motivoAnulacion || body.motivoAnulacion.trim().length < 3) {
      throw new HttpException('El motivo de anulación es obligatorio y debe tener al menos 3 caracteres.', HttpStatus.BAD_REQUEST);
    }
    return this.invoicesService.annul(id, body.motivoAnulacion, req.user.id);
  }

  @Get('by-client/:clientId')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener facturas por cliente', description: 'Lista todas las facturas de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Lista de facturas del cliente' })
  getInvoicesByClient(@Param('clientId') clientId: string) {
    return this.invoicesService.findByClientId(clientId);
  }

  @Post('by-client/:clientId')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear factura para cliente', description: 'Crea una nueva factura para un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Factura creada para el cliente' })
  createInvoiceForClient(@Param('clientId') clientId: string, @Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.createForClient(clientId, createInvoiceDto, req.user.id);
  }

  @Put('by-client/:clientId/:invoiceId')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar factura de cliente', description: 'Actualiza una factura de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'invoiceId', description: 'ID de la factura' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ status: 200, description: 'Factura actualizada' })
  updateInvoiceForClient(@Param('clientId') clientId: string, @Param('invoiceId') invoiceId: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
    return this.invoicesService.updateForClient(clientId, invoiceId, updateInvoiceDto, req.user.id);
  }

  @Patch('by-client/:clientId/:invoiceId')
  @Roles(Role.CLIENTE, Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar parcialmente factura de cliente', description: 'Actualiza parcialmente una factura de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'invoiceId', description: 'ID de la factura' })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ status: 200, description: 'Factura actualizada parcialmente' })
  patchInvoiceForClient(@Param('clientId') clientId: string, @Param('invoiceId') invoiceId: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
    return this.invoicesService.patchForClient(clientId, invoiceId, updateInvoiceDto, req.user.id);
  }

  @Delete('by-client/:clientId/:invoiceId')
  @Roles(Role.CLIENTE,Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar factura de cliente', description: 'Elimina una factura de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'invoiceId', description: 'ID de la factura' })
  @ApiResponse({ status: 200, description: 'Factura eliminada' })
  deleteInvoiceForClient(@Param('clientId') clientId: string, @Param('invoiceId') invoiceId: string, @Request() req) {
    return this.invoicesService.deleteForClient(clientId, invoiceId, req.user.id);
  }

  @Get('clients-with-invoices')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Listar clientes con facturas', description: 'Devuelve la lista de clientes que tienen al menos una factura.' })
  @ApiResponse({ status: 200, description: 'Lista de clientes con facturas', schema: { type: 'array', items: { type: 'object', properties: { clientId: { type: 'string' }, name: { type: 'string' }, email: { type: 'string' }, facturaCount: { type: 'number' } } } } })
  async getClientsWithInvoices() {
    return this.invoicesService.getClientsWithInvoices();
  }

  @Get(':id/audit-history')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Obtener historial de auditoría de factura',
    description: 'Devuelve el historial completo de cambios realizados en una factura'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial de auditoría',
    schema: {
      type: 'object',
      properties: {
        auditHistory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              fieldName: { type: 'string' },
              oldValue: { type: 'string' },
              newValue: { type: 'string' },
              description: { type: 'string' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' }
                }
              }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalChanges: { type: 'number' },
            lastModified: { type: 'string', format: 'date-time' },
            lastModifiedBy: { type: 'string' },
            changesByField: { type: 'object' },
            changesByUser: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getAuditHistory(@Param('id') id: string) {
    // Verificar que la factura existe
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
    }

    const auditHistory = await this.invoiceAuditService.getInvoiceAuditHistory(id);
    const summary = await this.invoiceAuditService.getChangesSummary(id);

    return {
      auditHistory,
      summary
    };
  }

  // ===== ENDPOINTS DE FIRMA DIGITAL =====

  @Post(':id/sign-pdf')
  @Roles(Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Firmar PDF de factura digitalmente',
    description: 'Firma digitalmente el PDF de una factura usando AutoFirma'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        certificateType: { 
          type: 'string', 
          enum: ['FNMT', 'DNIe', 'Other'],
          description: 'Tipo de certificado a usar'
        }
      },
      required: ['certificateType']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF firmado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        signedPdf: { type: 'string', description: 'PDF firmado en base64' },
        signatureInfo: {
          type: 'object',
          properties: {
            signer: { type: 'string' },
            timestamp: { type: 'string' },
            certificate: { type: 'string' },
            signatureAlgorithm: { type: 'string' }
          }
        },
        downloadUrl: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  @ApiResponse({ status: 500, description: 'Error en firma digital' })
  async signPdf(@Param('id') id: string, @Body() body: { certificateType: 'FNMT' | 'DNIe' | 'Other' }, @Request() req) {
    try {
      // 1. Verificar que la factura existe y pertenece al usuario
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice) {
        throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
      }

      if (invoice.emisorId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new HttpException('No autorizado para firmar esta factura', HttpStatus.FORBIDDEN);
      }

      // 2. Generar el PDF original
      const pdfBuffer = await this.invoicesService.generateInvoicePdfWithQR(invoice);
      const pdfBase64 = pdfBuffer.toString('base64');

      // 3. Preparar solicitud de firma
      const signatureRequest: SignatureRequest = {
        fileName: `factura_${invoice.numeroFactura || id}.pdf`,
        fileContent: pdfBase64,
        fileSize: pdfBuffer.length,
        certificateType: body.certificateType,
        userId: req.user.id,
        invoiceId: id
      };

      // 4. Firmar el PDF
      const signatureResponse = await this.digitalSignatureService.signPdfWithAutoFirma(signatureRequest);

      if (!signatureResponse.success) {
        throw new HttpException(signatureResponse.error || 'Error en firma digital', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // 5. Guardar el PDF firmado
      const fileName = await this.digitalSignatureService.saveSignedPdf(id, signatureResponse.signedPdf!);
      const downloadUrl = this.digitalSignatureService.getSignedPdfDownloadUrl(fileName);

      // 6. Registrar en auditoría
      await this.invoiceAuditService.logStatusChange(id, req.user.id, 'emitida', 'firmada', req.ip, req.headers['user-agent']);

      return {
        success: true,
        signedPdf: signatureResponse.signedPdf,
        signatureInfo: signatureResponse.signatureInfo,
        downloadUrl
      };

    } catch (error) {
      console.error('Error en firma digital de PDF:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error en firma digital', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/signed-pdf')
  @Roles(Role.ABOGADO, Role.ADMIN, Role.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Descargar PDF firmado',
    description: 'Descarga el PDF de la factura firmado digitalmente'
  })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF firmado',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'PDF firmado no encontrado' })
  async downloadSignedPdf(@Param('id') id: string, @Res() res: Response, @Request() req) {
    try {
      // Verificar que la factura existe
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice) {
        throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
      }

      // Verificar permisos
      if (req.user.role === 'CLIENTE' && invoice.receptorId !== req.user.id) {
        throw new HttpException('No autorizado', HttpStatus.FORBIDDEN);
      }

      if (req.user.role === 'ABOGADO' && invoice.emisorId !== req.user.id && req.user.role !== 'ADMIN') {
        throw new HttpException('No autorizado', HttpStatus.FORBIDDEN);
      }

      // Buscar el PDF firmado
      const uploadsDir = path.join(process.cwd(), 'uploads', 'signed-invoices');
      const files = fs.readdirSync(uploadsDir).filter(file => file.includes(`factura_firmada_${id}_`));
      
      if (files.length === 0) {
        throw new HttpException('PDF firmado no encontrado', HttpStatus.NOT_FOUND);
      }

      // Tomar el más reciente
      const latestFile = files.sort().reverse()[0];
      const filePath = path.join(uploadsDir, latestFile);
      
      // Enviar el archivo
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura_firmada_${invoice.numeroFactura || id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      
      res.sendFile(filePath);

    } catch (error) {
      console.error('Error descargando PDF firmado:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error descargando PDF firmado', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/upload-signed-pdf')
  @Roles(Role.ABOGADO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('signedPdf', {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), 'uploads', 'signed-invoices'));
      },
      filename: (req, file, cb) => {
        const invoiceId = req.params.id;
        const timestamp = Date.now();
        cb(null, `factura_firmada_${invoiceId}_${timestamp}.pdf`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Solo se permiten archivos PDF firmados'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
  }))
  @ApiOperation({ summary: 'Subir PDF firmado', description: 'Sube un PDF firmado digitalmente para una factura' })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ status: 200, description: 'PDF firmado guardado exitosamente', schema: { type: 'object', properties: { success: { type: 'boolean' }, fileName: { type: 'string' }, downloadUrl: { type: 'string' } } } })
  @ApiResponse({ status: 400, description: 'Archivo inválido' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async uploadSignedPdf(@Param('id') id: string, @UploadedFile() file: any, @Request() req) {
    if (!file) {
      throw new HttpException('No se recibió archivo PDF firmado', HttpStatus.BAD_REQUEST);
    }
    // Verificar que la factura existe y pertenece al usuario
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      throw new HttpException('Factura no encontrada', HttpStatus.NOT_FOUND);
    }
    if (invoice.emisorId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new HttpException('No autorizado para subir PDF firmado de esta factura', HttpStatus.FORBIDDEN);
    }
    // Opcional: marcar la factura como firmada en la base de datos
    await this.invoicesService.markAsSigned(id);
    // Devolver la URL de descarga
    const fileName = file.filename;
    const downloadUrl = `/uploads/signed-invoices/${fileName}`;
    return { success: true, fileName, downloadUrl };
  }

  @Get('autofirma/status')
  @Roles(Role.ABOGADO, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ 
    summary: 'Verificar estado de AutoFirma',
    description: 'Verifica si AutoFirma está disponible y funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de AutoFirma',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean' },
        status: { type: 'string' },
        message: { type: 'string' },
        autofirma: {
          type: 'object',
          properties: {
            installed: { type: 'boolean' },
            running: { type: 'boolean' },
            available: { type: 'boolean' },
            installation: { type: 'object' },
            runningInfo: { type: 'object' }
          }
        }
      }
    }
  })
  async checkAutoFirmaStatus() {
    try {
      const detailedStatus = await this.digitalSignatureService.getAutoFirmaDetailedStatus();
      
      return {
        available: detailedStatus.autofirma?.available || false,
        status: detailedStatus.status || 'error',
        message: detailedStatus.message || 'Error verificando AutoFirma',
        autofirma: detailedStatus.autofirma || {
          installed: false,
          running: false,
          available: false
        }
      };
    } catch (error) {
      return {
        available: false,
        status: 'error',
        message: 'Error verificando estado de AutoFirma',
        autofirma: {
          installed: false,
          running: false,
          available: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }
      };
    }
  }

  @Get(':id/html-preview')
  @Roles(Role.ABOGADO, Role.ADMIN, Role.CLIENTE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Vista previa HTML de la factura', description: 'Devuelve el HTML renderizado de la factura para previsualización' })
  @ApiParam({ name: 'id', description: 'ID de la factura', type: 'string' })
  @ApiResponse({ status: 200, description: 'HTML de la factura', schema: { type: 'string' } })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getInvoiceHtmlPreview(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const invoice = await this.invoicesService.findOne(id);
    if (!invoice) {
      return res.status(404).send('Factura no encontrada');
    }
    // Verifica permisos
    if (invoice.emisorId !== req.user.id && invoice.receptorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).send('No autorizado para ver esta factura');
    }
    // Genera el HTML usando el mismo template que el PDF
    const html = await this.invoicesService.generateInvoiceHtml(invoice);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }
} 