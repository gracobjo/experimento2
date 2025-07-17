import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { FacturaeController } from './facturae.controller';
import { FacturaeService } from './facturae.service';
import { ExternalSystemsController } from './external-systems.controller';
import { ExternalSystemsService } from './external-systems.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { InvoiceAuditService } from './invoice-audit.service';
import { AuthModule } from '../auth/auth.module';
 
@Module({
  imports: [AuthModule],
  controllers: [InvoicesController, FacturaeController, ExternalSystemsController],
  providers: [InvoicesService, FacturaeService, ExternalSystemsService, PdfGeneratorService, InvoiceAuditService],
})
export class InvoicesModule {} 