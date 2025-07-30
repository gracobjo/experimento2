import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {
    console.log('NotesService constructor called');
  }

  async create(createNoteDto: CreateNoteDto, userId: string) {
    console.log('Creating note with:', { createNoteDto, userId });
    
    const newNote = await this.prisma.note.create({
      data: {
        ...createNoteDto,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    console.log('Created note:', newNote);
    return newNote;
  }

  async findAll(expedienteId: string, userId: string, userRole: string) {
    console.log('NotesService.findAll called with:', { expedienteId, userId, userRole });
    
    // Construir la consulta base
    const where: any = {
      expedienteId: expedienteId,
    };
    
    // Si no es admin o abogado, solo mostrar notas públicas o propias
    if (userRole !== 'ADMIN' && userRole !== 'ABOGADO') {
      where.OR = [
        { isPrivate: false },
        { authorId: userId },
      ];
    }
    
    const notes = await this.prisma.note.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log('Found notes:', notes);
    return notes;
  }

  async findOne(id: string, userId: string, userRole: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!note) {
      throw new NotFoundException('Nota no encontrada');
    }

    // Verificar permisos
    if (note.isPrivate && note.authorId !== userId && userRole !== 'ADMIN' && userRole !== 'ABOGADO') {
      throw new ForbiddenException('No tienes permisos para ver esta nota');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string, userRole: string) {
    // Verificar que la nota existe y obtener información del autor
    const existingNote = await this.prisma.note.findUnique({
      where: { id },
      select: { authorId: true },
    });
    
    if (!existingNote) {
      throw new NotFoundException('Nota no encontrada');
    }
    
    // Solo el autor o un admin puede editar
    if (existingNote.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para editar esta nota');
    }

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return updatedNote;
  }

  async remove(id: string, userId: string, userRole: string) {
    // Verificar que la nota existe y obtener información del autor
    const existingNote = await this.prisma.note.findUnique({
      where: { id },
      select: { authorId: true },
    });
    
    if (!existingNote) {
      throw new NotFoundException('Nota no encontrada');
    }
    
    // Solo el autor o un admin puede eliminar
    if (existingNote.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para eliminar esta nota');
    }

    const deletedNote = await this.prisma.note.delete({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return deletedNote;
  }

  async testDatabase() {
    const count = await this.prisma.note.count();
    return count;
  }

  async getTempNotes() {
    const notes = await this.prisma.note.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return {
      totalNotes: notes.length,
      notes: notes,
    };
  }
} 