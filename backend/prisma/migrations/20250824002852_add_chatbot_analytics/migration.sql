-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'CLIENTE';

-- CreateTable
CREATE TABLE "public"."chatbot_conversations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userPhone" TEXT,
    "conversationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "userMessages" INTEGER NOT NULL DEFAULT 0,
    "botMessages" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" TIMESTAMP(3) NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "metadata" JSONB,
    "appointmentId" TEXT,

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatbot_message_details" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "confidence" DOUBLE PRECISION,
    "entities" JSONB,
    "sentiment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingTime" INTEGER,
    "error" TEXT,

    CONSTRAINT "chatbot_message_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "emailProvider" TEXT,
    "messageId" TEXT,
    "metadata" JSONB,
    "appointmentId" TEXT,
    "userId" TEXT,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chatbot_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "completedConversations" INTEGER NOT NULL DEFAULT 0,
    "abandonedConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "averageMessagesPerConversation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "appointmentBookings" INTEGER NOT NULL DEFAULT 0,
    "conversionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topIntents" JSONB,
    "topEntities" JSONB,
    "userSatisfaction" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "languageDistribution" JSONB,
    "deviceDistribution" JSONB,

    CONSTRAINT "chatbot_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_conversations_sessionId_key" ON "public"."chatbot_conversations"("sessionId");

-- AddForeignKey
ALTER TABLE "public"."chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."visitor_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chatbot_message_details" ADD CONSTRAINT "chatbot_message_details_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."chatbot_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."visitor_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_logs" ADD CONSTRAINT "email_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
