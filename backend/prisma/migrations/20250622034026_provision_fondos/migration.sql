-- CreateTable
CREATE TABLE "ProvisionFondos" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "expedienteId" TEXT,
    "invoiceId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisionFondos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProvisionFondos" ADD CONSTRAINT "ProvisionFondos_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionFondos" ADD CONSTRAINT "ProvisionFondos_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisionFondos" ADD CONSTRAINT "ProvisionFondos_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
