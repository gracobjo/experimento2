-- CreateTable
CREATE TABLE "visitor_appointments" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "consultationReason" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3) NOT NULL,
    "alternativeDate" TIMESTAMP(3),
    "consultationType" TEXT NOT NULL,
    "notes" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "assignedLawyerId" TEXT,
    "confirmedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_appointments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "visitor_appointments" ADD CONSTRAINT "visitor_appointments_assignedLawyerId_fkey" FOREIGN KEY ("assignedLawyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
