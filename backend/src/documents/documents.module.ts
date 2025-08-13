import { Module } from '@nestjs/common';
import { CloudinaryDocumentsService } from './cloudinary-documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [DocumentsController],
  providers: [CloudinaryDocumentsService, CloudinaryStorageService],
  exports: [CloudinaryDocumentsService],
})
export class DocumentsModule {} 