/*
  Warnings:

  - The values [ACCEPTED] on the enum `InvitationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvitationStatus_new" AS ENUM ('PENDING', 'USED', 'EXPIRED', 'REJECTED');
ALTER TABLE "public"."invitations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invitations" ALTER COLUMN "status" TYPE "InvitationStatus_new" USING ("status"::text::"InvitationStatus_new");
ALTER TYPE "InvitationStatus" RENAME TO "InvitationStatus_old";
ALTER TYPE "InvitationStatus_new" RENAME TO "InvitationStatus";
DROP TYPE "public"."InvitationStatus_old";
ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
