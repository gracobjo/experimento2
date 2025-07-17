-- CreateTable
CREATE TABLE "InvoiceAuditHistory" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceAuditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceAuditHistory_invoiceId_idx" ON "InvoiceAuditHistory"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceAuditHistory_userId_idx" ON "InvoiceAuditHistory"("userId");

-- CreateIndex
CREATE INDEX "InvoiceAuditHistory_createdAt_idx" ON "InvoiceAuditHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "InvoiceAuditHistory" ADD CONSTRAINT "InvoiceAuditHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceAuditHistory" ADD CONSTRAINT "InvoiceAuditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
