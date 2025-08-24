-- AlterTable
ALTER TABLE "public"."Document" ADD COLUMN     "fileData" BYTEA,
ALTER COLUMN "fileUrl" DROP NOT NULL;
