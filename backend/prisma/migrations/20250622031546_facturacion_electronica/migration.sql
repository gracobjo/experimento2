-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "fechaFactura" TIMESTAMP(3) NOT NULL,
    "tipoFactura" TEXT NOT NULL,
    "emisorId" TEXT NOT NULL,
    "receptorId" TEXT NOT NULL,
    "expedienteId" TEXT,
    "importeTotal" DOUBLE PRECISION NOT NULL,
    "baseImponible" DOUBLE PRECISION NOT NULL,
    "cuotaIVA" DOUBLE PRECISION NOT NULL,
    "tipoIVA" DOUBLE PRECISION NOT NULL,
    "regimenIvaEmisor" TEXT NOT NULL,
    "claveOperacion" TEXT NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "fechaOperacion" TIMESTAMP(3) NOT NULL,
    "xml" TEXT,
    "xmlFirmado" TEXT,
    "estado" TEXT NOT NULL,
    "selloTiempo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_numeroFactura_key" ON "Invoice"("numeroFactura");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
