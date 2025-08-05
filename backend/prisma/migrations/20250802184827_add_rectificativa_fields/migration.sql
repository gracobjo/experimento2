-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('BORRADOR', 'EMITIDA', 'ENVIADA', 'NOTIFICADA', 'ACEPTADA', 'RECHAZADA', 'ANULADA');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "facturaOriginalId" TEXT,
ADD COLUMN     "motivoRectificacion" TEXT,
ADD COLUMN     "tipoRectificacion" TEXT,
ALTER COLUMN "estado" SET DEFAULT 'borrador';

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_facturaOriginalId_fkey" FOREIGN KEY ("facturaOriginalId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
