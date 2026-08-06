CREATE TYPE "CatalogItemType" AS ENUM (
  'SISTEMA',
  'PROJETO',
  'SERVICO_INFRAESTRUTURA'
);

CREATE TYPE "OperationalStatus" AS ENUM (
  'OK',
  'INSTAVEL',
  'PARADO'
);

CREATE TYPE "ResponsibilityRole" AS ENUM (
  'TECNICO',
  'GERENCIAL'
);

CREATE TABLE "catalog_items" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "type" "CatalogItemType" NOT NULL,
  "acronym" VARCHAR(30) NOT NULL,
  "name" VARCHAR(160) NOT NULL,
  "description" TEXT NOT NULL,
  "status" "OperationalStatus" NOT NULL DEFAULT 'OK',
  "status_note" TEXT,
  "expected_return_at" TIMESTAMPTZ(6),
  "status_updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "catalog_items_acronym_upper_key"
  ON "catalog_items" (upper("acronym"));

CREATE INDEX "catalog_items_active_idx" ON "catalog_items" ("active");
CREATE INDEX "catalog_items_status_idx" ON "catalog_items" ("status");
CREATE INDEX "catalog_items_type_idx" ON "catalog_items" ("type");

CREATE TABLE "responsibles" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(160) NOT NULL,
  "phone" VARCHAR(40),
  "email" VARCHAR(254),
  "contact_channel" VARCHAR(120),
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "responsibles_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "responsibles_contact_required_check" CHECK (
    ("phone" IS NOT NULL AND btrim("phone") <> '')
    OR ("email" IS NOT NULL AND btrim("email") <> '')
    OR ("contact_channel" IS NOT NULL AND btrim("contact_channel") <> '')
  )
);

CREATE INDEX "responsibles_active_idx" ON "responsibles" ("active");
CREATE INDEX "responsibles_name_idx" ON "responsibles" ("name");

CREATE TABLE "item_responsibilities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "item_id" UUID NOT NULL,
  "responsible_id" UUID NOT NULL,
  "role" "ResponsibilityRole" NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "item_responsibilities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "item_responsibilities_item_id_responsible_id_role_key"
  ON "item_responsibilities" ("item_id", "responsible_id", "role");

CREATE INDEX "item_responsibilities_item_id_idx"
  ON "item_responsibilities" ("item_id");

CREATE INDEX "item_responsibilities_responsible_id_idx"
  ON "item_responsibilities" ("responsible_id");

ALTER TABLE "item_responsibilities"
  ADD CONSTRAINT "item_responsibilities_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "item_responsibilities"
  ADD CONSTRAINT "item_responsibilities_responsible_id_fkey"
  FOREIGN KEY ("responsible_id") REFERENCES "responsibles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
