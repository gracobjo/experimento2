import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotesService } from './notes.service';

@ApiTags('public-notes')
@Controller('public-notes')
export class PublicNotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get('test')
  @ApiOperation({ summary: 'Endpoint público de prueba' })
  test() {
    console.log('Public test endpoint called');
    return { 
      message: 'Public notes endpoint is working!', 
      timestamp: new Date().toISOString(),
      serviceAvailable: true
    };
  }

  @Get('temp-notes')
  @ApiOperation({ summary: 'Ver notas temporales disponibles' })
  getTempNotes() {
    return this.notesService.getTempNotes();
  }
} 