import { Module } from '@nestjs/common';
import { CloudinaryDocumentsService } from './cloudinary-documents.service';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { PostgresStorageService } from '../storage/postgres-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [DocumentsController],
  providers: [
    CloudinaryDocumentsService, 
    DocumentsService, 
    CloudinaryStorageService,
    PostgresStorageService
  ],
  exports: [CloudinaryDocumentsService, DocumentsService],
})
export class DocumentsModule {} 