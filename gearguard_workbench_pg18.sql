-- GearGuard (Single Company: XYZ) — PostgreSQL DDL (drawSQL-friendly)
-- Based on problem statement requirements. 
BEGIN;

SET client_min_messages TO WARNING;
SET standard_conforming_strings = ON;
SET TIME ZONE 'UTC';

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- SCHEMA ----------
DROP SCHEMA IF EXISTS app CASCADE;
CREATE SCHEMA app;
SET search_path TO app, public;

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE maintenance_type AS ENUM ('CORRECTIVE','PREVENTIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_stage AS ENUM ('NEW','IN_PROGRESS','REPAIRED','SCRAP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE request_priority AS ENUM ('LOW','MEDIUM','HIGH','URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE equipment_status AS ENUM ('ACTIVE','SCRAPPED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- UPDATED_AT TRIGGER ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- SINGLE COMPANY ----------
CREATE TABLE IF NOT EXISTS company (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_company_updated_at
BEFORE UPDATE ON company
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed a single company (XYZ)
INSERT INTO company (name)
VALUES ('XYZ')
ON CONFLICT (name) DO NOTHING;

-- ---------- DEPARTMENTS (Equipment tracking by dept) ----------
CREATE TABLE IF NOT EXISTS department (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_department_company ON department(company_id);

CREATE TRIGGER trg_department_updated_at
BEFORE UPDATE ON department
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- USERS/PEOPLE (Employees/Technicians) ----------
CREATE TABLE IF NOT EXISTS app_user (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  email       text,
  avatar_url  text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);

CREATE INDEX IF NOT EXISTS idx_app_user_company ON app_user(company_id);

CREATE TRIGGER trg_app_user_updated_at
BEFORE UPDATE ON app_user
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- EQUIPMENT CATEGORIES (Auto-filled into request) ----------
CREATE TABLE IF NOT EXISTS equipment_category (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_equipment_category_company ON equipment_category(company_id);

CREATE TRIGGER trg_equipment_category_updated_at
BEFORE UPDATE ON equipment_category
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- MAINTENANCE TEAMS ----------
CREATE TABLE IF NOT EXISTS maintenance_team (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE INDEX IF NOT EXISTS idx_maintenance_team_company ON maintenance_team(company_id);

CREATE TRIGGER trg_maintenance_team_updated_at
BEFORE UPDATE ON maintenance_team
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS maintenance_team_member (
  team_id     uuid NOT NULL REFERENCES maintenance_team(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_member_user ON maintenance_team_member(user_id);

-- ---------- EQUIPMENT (Assets database) ----------
CREATE TABLE IF NOT EXISTS equipment (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,

  name                  text NOT NULL,
  serial_number         text NOT NULL,

  category_id           uuid REFERENCES equipment_category(id) ON DELETE SET NULL,

  department_id         uuid REFERENCES department(id) ON DELETE SET NULL,  -- track by department
  owner_user_id         uuid REFERENCES app_user(id) ON DELETE SET NULL,    -- track by employee

  maintenance_team_id   uuid REFERENCES maintenance_team(id) ON DELETE SET NULL, -- default team
  default_technician_id uuid REFERENCES app_user(id) ON DELETE SET NULL,          -- default technician

  location              text,                 -- physical location
  purchase_date         date,
  warranty_end_date     date,

  status                equipment_status NOT NULL DEFAULT 'ACTIVE',
  scrapped_at           timestamptz,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  UNIQUE (company_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_equipment_company ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department_id);

CREATE TRIGGER trg_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- MAINTENANCE REQUESTS (Lifecycle of repair job) ----------
CREATE TABLE IF NOT EXISTS maintenance_request (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,

  subject          text NOT NULL,           -- what is wrong
  description      text,

  equipment_id     uuid NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,

  -- Auto-filled from equipment (store snapshot fields for reporting/filtering)
  equipment_category_id uuid REFERENCES equipment_category(id) ON DELETE SET NULL,
  team_id          uuid REFERENCES maintenance_team(id) ON DELETE SET NULL,

  created_by_id    uuid REFERENCES app_user(id) ON DELETE SET NULL,

  assigned_to_id   uuid REFERENCES app_user(id) ON DELETE SET NULL, -- technician
  type             maintenance_type NOT NULL DEFAULT 'CORRECTIVE',
  priority         request_priority NOT NULL DEFAULT 'MEDIUM',

  stage            request_stage NOT NULL DEFAULT 'NEW',

  request_date     date NOT NULL DEFAULT CURRENT_DATE,
  scheduled_at     timestamptz,             -- required for preventive/calendar
  duration_minutes integer NOT NULL DEFAULT 0, -- "Hours spent" stored in minutes

  due_at           timestamptz,             -- for overdue indicator
  is_overdue       boolean NOT NULL DEFAULT false,

  repaired_at      timestamptz,
  scrapped_at      timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_duration_nonneg CHECK (duration_minutes >= 0)
);

CREATE INDEX IF NOT EXISTS idx_request_company ON maintenance_request(company_id);
CREATE INDEX IF NOT EXISTS idx_request_equipment ON maintenance_request(equipment_id);
CREATE INDEX IF NOT EXISTS idx_request_team ON maintenance_request(team_id);
CREATE INDEX IF NOT EXISTS idx_request_stage ON maintenance_request(stage);
CREATE INDEX IF NOT EXISTS idx_request_scheduled_at ON maintenance_request(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_request_category ON maintenance_request(equipment_category_id);
CREATE INDEX IF NOT EXISTS idx_request_assigned_to ON maintenance_request(assigned_to_id);

CREATE TRIGGER trg_maintenance_request_updated_at
BEFORE UPDATE ON maintenance_request
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- REQUEST COMMENTS / WORKLOG ----------
CREATE TABLE IF NOT EXISTS request_comment (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES maintenance_request(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES app_user(id) ON DELETE SET NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_comment_request ON request_comment(request_id);

-- ---------- ACTIVITY / AUDIT (optional but useful for reporting) ----------
CREATE TABLE IF NOT EXISTS request_activity (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES maintenance_request(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES app_user(id) ON DELETE SET NULL,
  event_type  text NOT NULL,    -- CREATED / ASSIGNED / STAGE_CHANGED / SCHEDULED / LOGGED_TIME
  old_value   jsonb,
  new_value   jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_request_activity_request ON request_activity(request_id);
CREATE INDEX IF NOT EXISTS idx_request_activity_event ON request_activity(event_type);

-- ---------- SCRAP LOGIC (when request -> SCRAP, equipment -> SCRAPPED) ----------
CREATE OR REPLACE FUNCTION scrap_equipment_on_request_scrap()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage = 'SCRAP' AND (OLD.stage IS DISTINCT FROM 'SCRAP') THEN
    UPDATE equipment
      SET status = 'SCRAPPED',
          scrapped_at = COALESCE(scrapped_at, now()),
          updated_at = now()
    WHERE id = NEW.equipment_id;

    NEW.scrapped_at = COALESCE(NEW.scrapped_at, now());
  END IF;

  IF NEW.stage = 'REPAIRED' AND (OLD.stage IS DISTINCT FROM 'REPAIRED') THEN
    NEW.repaired_at = COALESCE(NEW.repaired_at, now());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_request_scrap_logic ON maintenance_request;

CREATE TRIGGER trg_request_scrap_logic
BEFORE UPDATE OF stage ON maintenance_request
FOR EACH ROW
EXECUTE FUNCTION scrap_equipment_on_request_scrap();

-- ---------- AUTO-FILL SNAPSHOT FIELDS ON REQUEST INSERT ----------
-- When a request is created and equipment selected, copy equipment category + default team.
CREATE OR REPLACE FUNCTION autofill_request_from_equipment()
RETURNS TRIGGER AS $$
DECLARE
  v_category uuid;
  v_team     uuid;
BEGIN
  SELECT category_id, maintenance_team_id
    INTO v_category, v_team
  FROM equipment
  WHERE id = NEW.equipment_id;

  IF NEW.equipment_category_id IS NULL THEN
    NEW.equipment_category_id = v_category;
  END IF;

  IF NEW.team_id IS NULL THEN
    NEW.team_id = v_team;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_request_autofill ON maintenance_request;

CREATE TRIGGER trg_request_autofill
BEFORE INSERT ON maintenance_request
FOR EACH ROW
EXECUTE FUNCTION autofill_request_from_equipment();

-- ---------- VIEWS (for dashboard/kanban counts) ----------
CREATE OR REPLACE VIEW v_open_requests AS
SELECT *
FROM maintenance_request
WHERE stage IN ('NEW','IN_PROGRESS');

CREATE OR REPLACE VIEW v_request_counts AS
SELECT
  company_id,
  COUNT(*) FILTER (WHERE stage IN ('NEW','IN_PROGRESS')) AS open_count,
  COUNT(*) FILTER (WHERE stage = 'NEW') AS new_count,
  COUNT(*) FILTER (
    WHERE stage IN ('NEW','IN_PROGRESS')
      AND due_at IS NOT NULL
      AND due_at < now()
  ) AS overdue_count
FROM maintenance_request
GROUP BY company_id;

COMMIT;
