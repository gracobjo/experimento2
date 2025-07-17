-- CreateTable
CREATE TABLE "teleassistance_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "remoteTool" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sessionCode" TEXT NOT NULL,
    "resolution" TEXT,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teleassistance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teleassistance_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teleassistance_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teleassistance_sessions_sessionCode_key" ON "teleassistance_sessions"("sessionCode");

-- AddForeignKey
ALTER TABLE "teleassistance_sessions" ADD CONSTRAINT "teleassistance_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleassistance_sessions" ADD CONSTRAINT "teleassistance_sessions_assistantId_fkey" FOREIGN KEY ("assistantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleassistance_messages" ADD CONSTRAINT "teleassistance_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "teleassistance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teleassistance_messages" ADD CONSTRAINT "teleassistance_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
