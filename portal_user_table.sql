-- Portal Users Table for Authentication
-- Run this to add portal user authentication

BEGIN;

SET search_path TO app, public;

-- Create portal_user table for authentication
CREATE TABLE IF NOT EXISTS portal_user (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  email       text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_user_email ON portal_user(email);
CREATE INDEX IF NOT EXISTS idx_portal_user_company ON portal_user(company_id);

CREATE TRIGGER trg_portal_user_updated_at
BEFORE UPDATE ON portal_user
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
