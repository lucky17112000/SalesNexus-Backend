-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organization_name_index" ON "organizations"("name");

-- CreateIndex
CREATE INDEX "organization_slug_index" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organization_createdAt_index" ON "organizations"("createdAt");

-- CreateIndex
CREATE INDEX "organization_updatedAt_index" ON "organizations"("updatedAt");
