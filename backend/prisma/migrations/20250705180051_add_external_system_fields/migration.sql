-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "fechaEnvio" TIMESTAMP(3),
ADD COLUMN     "sistemaEnvio" TEXT;
