import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotesService } from './notes/notes.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly notesService: NotesService) {}
  @Get()
  @ApiOperation({ summary: 'Root endpoint', description: 'Returns a welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message' })
  getHello(): string {
    return 'Despacho Legal API - Sistema Integral de Gestión Legal';
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Health check endpoint for Render' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'API Health check', description: 'API health check endpoint for Render' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getApiHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

  @Get('test-notes')
  @ApiOperation({ summary: 'Test notes service', description: 'Test endpoint for notes service' })
  @ApiResponse({ status: 200, description: 'Notes service test' })
  testNotes() {
    return this.notesService.getTempNotes();
  }
} 