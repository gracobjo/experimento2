import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva nota' })
  @ApiResponse({ status: 201, description: 'Nota creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return this.notesService.create(createNoteDto, req.user.id);
  }

  @Get('test')
  @ApiOperation({ summary: 'Endpoint de prueba para verificar que el módulo funciona' })
  test() {
    console.log('Test endpoint called');
    return { 
      message: 'Notes module is working!', 
      timestamp: new Date().toISOString(),
      serviceAvailable: true
    };
  }

  @Get('public/test')
  @ApiOperation({ summary: 'Endpoint público de prueba' })
  @UseGuards() // Sin guard para hacerlo público
  publicTest() {
    console.log('Public test endpoint called');
    return { 
      message: 'Public notes endpoint is working!', 
      timestamp: new Date().toISOString(),
      serviceAvailable: true
    };
  }

  @Get('test-db')
  @ApiOperation({ summary: 'Endpoint de prueba para verificar la base de datos' })
  async testDb() {
    try {
      // Intentar una consulta simple para verificar si Prisma funciona
      const count = await this.notesService.testDatabase();
      return { 
        message: 'Database connection working!', 
        notesCount: count,
        timestamp: new Date().toISOString() 
      };
    } catch (error: any) {
      return { 
        message: 'Database error', 
        error: error.message,
        timestamp: new Date().toISOString() 
      };
    }
  }

  @Get('test/temp-notes')
  @ApiOperation({ summary: 'Ver notas temporales disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de notas temporales' })
  getTempNotes() {
    return this.notesService.getTempNotes();
  }

  @Get('expediente/:expedienteId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las notas de un expediente' })
  @ApiParam({ name: 'expedienteId', description: 'ID del expediente' })
  @ApiResponse({ status: 200, description: 'Lista de notas obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Param('expedienteId') expedienteId: string, @Request() req) {
    console.log('Fetching notes for expediente:', expedienteId);
    console.log('User:', req.user);
    return this.notesService.findAll(expedienteId, req.user.id, req.user.role);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener una nota específica' })
  @ApiParam({ name: 'id', description: 'ID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para ver esta nota' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.notesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar una nota' })
  @ApiParam({ name: 'id', description: 'ID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para editar esta nota' })
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Request() req) {
    return this.notesService.update(id, updateNoteDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una nota' })
  @ApiParam({ name: 'id', description: 'ID de la nota' })
  @ApiResponse({ status: 200, description: 'Nota eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Nota no encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar esta nota' })
  remove(@Param('id') id: string, @Request() req) {
    return this.notesService.remove(id, req.user.id, req.user.role);
  }
} 