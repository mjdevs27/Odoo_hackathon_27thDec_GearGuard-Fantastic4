-- ============================================================
-- GearGuard Dashboard Seed Data
-- Run this in pgAdmin AFTER running gearguard_workbench_pg18.sql
-- ============================================================

SET search_path TO app, public;

-- ============================================================
-- 1. Get or Create Company ID
-- ============================================================
-- The company 'XYZ' should already exist from the base schema
-- If not, create it
INSERT INTO company (name)
VALUES ('XYZ')
ON CONFLICT (name) DO NOTHING;

-- Get the company ID for use in other inserts
DO $$
DECLARE
    v_company_id UUID;
BEGIN
    SELECT id INTO v_company_id FROM company WHERE name = 'XYZ' LIMIT 1;
    
    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Company XYZ not found. Run gearguard_workbench_pg18.sql first.';
    END IF;
    
    RAISE NOTICE 'Using Company ID: %', v_company_id;
END $$;

-- ============================================================
-- 2. Insert Departments
-- ============================================================
INSERT INTO department (company_id, name)
SELECT c.id, dept.name
FROM company c, (VALUES 
    ('Production'),
    ('Assembly'),
    ('Quality Control'),
    ('Maintenance'),
    ('Warehouse')
) AS dept(name)
WHERE c.name = 'XYZ'
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================================
-- 3. Insert Users/Technicians
-- ============================================================
INSERT INTO app_user (company_id, full_name, email, is_active)
SELECT c.id, u.full_name, u.email, TRUE
FROM company c, (VALUES 
    ('Vansh Momaya', 'vanshmomaya9@gmail.com'),
    ('Moksh Jhaveri', 'mokshjhaveri9@gmail.com'),
    ('ebrahim gamdiwala', 'ebrahimgamdiwala@gmail.com'),
    ('megh dave', 'meghdave9@gmail.com'),
    ('rutu mehta', 'rutumehta9@gmail.com'),
    ('ajit kumar', 'ajitkumar9@gmail.com'),
    ('jatin', 'jatin9@gmail.com')
) AS u(full_name, email)
WHERE c.name = 'XYZ'
ON CONFLICT (company_id, email) DO NOTHING;

-- ============================================================
-- 4. Insert Equipment Categories
-- ============================================================
INSERT INTO equipment_category (company_id, name)
SELECT c.id, cat.name
FROM company c, (VALUES 
    ('Computer & IT'),
    ('Machinery'),
    ('Electrical'),
    ('Hydraulic'),
    ('Pneumatic'),
    ('Measuring Tools'),
    ('Safety Equipment')
) AS cat(name)
WHERE c.name = 'XYZ'
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================================
-- 5. Insert Maintenance Teams
-- ============================================================
INSERT INTO maintenance_team (company_id, name)
SELECT c.id, t.name
FROM company c, (VALUES 
    ('Maintenance Team A'),
    ('Electrical Team'),
    ('Mechanical Team'),
    ('Emergency Response')
) AS t(name)
WHERE c.name = 'XYZ'
ON CONFLICT (company_id, name) DO NOTHING;

-- ============================================================
-- 6. Add Team Members (Assign users to teams)
-- ============================================================
INSERT INTO maintenance_team_member (team_id, user_id)
SELECT mt.id, au.id
FROM maintenance_team mt
CROSS JOIN app_user au
WHERE mt.company_id = au.company_id
AND (
    (mt.name = 'Maintenance Team A' AND au.full_name IN ('Mitchel Admin', 'Alex Foster'))
    OR (mt.name = 'Electrical Team' AND au.full_name IN ('Sarah Johnson', 'Mike Chen'))
    OR (mt.name = 'Mechanical Team' AND au.full_name IN ('Emma Wilson', 'John Smith'))
    OR (mt.name = 'Emergency Response' AND au.full_name IN ('Mitchel Admin', 'Sarah Johnson', 'John Smith'))
)
ON CONFLICT (team_id, user_id) DO NOTHING;

-- ============================================================
-- 7. Insert Equipment (Machines & Tools)
-- ============================================================
INSERT INTO equipment (company_id, name, serial_number, category_id, department_id, maintenance_team_id, default_technician_id, location, status)
SELECT 
    c.id,
    e.name,
    e.serial,
    ec.id,
    d.id,
    mt.id,
    au.id,
    e.location,
    'ACTIVE'::equipment_status
FROM company c
CROSS JOIN (VALUES 
    ('CNC Machine', 'CNC-2024-001', 'Machinery', 'Production', 'Maintenance Team A', 'Mitchel Admin', 'Building A - Floor 1'),
    ('Drill Press', 'DRL-2024-002', 'Machinery', 'Production', 'Mechanical Team', 'Alex Foster', 'Building A - Floor 1'),
    ('Lathe Machine', 'LTH-2024-003', 'Machinery', 'Production', 'Maintenance Team A', 'Mitchel Admin', 'Building A - Floor 2'),
    ('Assembly Line 1', 'ASM-2024-004', 'Machinery', 'Assembly', 'Mechanical Team', 'Emma Wilson', 'Building B'),
    ('Measuring Tool Set', 'MSR-2024-005', 'Measuring Tools', 'Quality Control', 'Maintenance Team A', 'Sarah Johnson', 'QC Lab'),
    ('Hydraulic Press', 'HYD-2024-006', 'Hydraulic', 'Production', 'Mechanical Team', 'John Smith', 'Building A - Floor 1'),
    ('Conveyor Belt A', 'CNV-2024-007', 'Machinery', 'Warehouse', 'Maintenance Team A', 'Alex Foster', 'Warehouse'),
    ('Industrial Robot', 'ROB-2024-008', 'Machinery', 'Production', 'Electrical Team', 'Mike Chen', 'Building A - Floor 2'),
    ('Packaging Machine', 'PKG-2024-009', 'Machinery', 'Warehouse', 'Mechanical Team', 'Lisa Brown', 'Warehouse'),
    ('Air Compressor', 'CMP-2024-010', 'Pneumatic', 'Maintenance', 'Maintenance Team A', 'Mitchel Admin', 'Utility Room')
) AS e(name, serial, category, department, team, technician, location)
LEFT JOIN equipment_category ec ON ec.name = e.category AND ec.company_id = c.id
LEFT JOIN department d ON d.name = e.department AND d.company_id = c.id
LEFT JOIN maintenance_team mt ON mt.name = e.team AND mt.company_id = c.id
LEFT JOIN app_user au ON au.full_name = e.technician AND au.company_id = c.id
WHERE c.name = 'XYZ'
ON CONFLICT (company_id, serial_number) DO NOTHING;

-- ============================================================
-- 8. Insert Maintenance Requests
-- ============================================================

-- Function to get equipment ID by serial
CREATE OR REPLACE FUNCTION get_equipment_id(p_serial TEXT) RETURNS UUID AS $$
    SELECT id FROM equipment WHERE serial_number = p_serial LIMIT 1;
$$ LANGUAGE sql;

-- Function to get user ID by name
CREATE OR REPLACE FUNCTION get_user_id(p_name TEXT) RETURNS UUID AS $$
    SELECT id FROM app_user WHERE full_name = p_name LIMIT 1;
$$ LANGUAGE sql;

-- Insert NEW requests
INSERT INTO maintenance_request (company_id, subject, description, equipment_id, assigned_to_id, type, priority, stage, due_at, is_overdue)
SELECT 
    c.id,
    r.subject,
    r.description,
    get_equipment_id(r.equipment_serial),
    get_user_id(r.technician),
    r.mtype::maintenance_type,
    r.priority::request_priority,
    r.stage::request_stage,
    r.due_at,
    r.is_overdue
FROM company c, (VALUES 
    ('Test Activity', 'Regular system check on CNC Machine', 'CNC-2024-001', 'Mitchel Admin', 'CORRECTIVE', 'MEDIUM', 'NEW', NOW() + INTERVAL '5 days', FALSE),
    ('Oil Change Required', 'Urgent oil change needed for Drill Press - overdue', 'DRL-2024-002', 'Alex Foster', 'PREVENTIVE', 'HIGH', 'NEW', NOW() - INTERVAL '2 days', TRUE),
    ('Filter Replacement', 'Replace air filters in ventilation system', 'CMP-2024-010', 'Sarah Johnson', 'PREVENTIVE', 'LOW', 'NEW', NOW() + INTERVAL '10 days', FALSE)
) AS r(subject, description, equipment_serial, technician, mtype, priority, stage, due_at, is_overdue)
WHERE c.name = 'XYZ';

-- Insert IN_PROGRESS requests
INSERT INTO maintenance_request (company_id, subject, description, equipment_id, assigned_to_id, type, priority, stage, due_at, is_overdue)
SELECT 
    c.id,
    r.subject,
    r.description,
    get_equipment_id(r.equipment_serial),
    get_user_id(r.technician),
    r.mtype::maintenance_type,
    r.priority::request_priority,
    r.stage::request_stage,
    r.due_at,
    r.is_overdue
FROM company c, (VALUES 
    ('Motor Replacement', 'Complete motor overhaul on Lathe Machine', 'LTH-2024-003', 'Mitchel Admin', 'CORRECTIVE', 'URGENT', 'IN_PROGRESS', NOW() + INTERVAL '1 day', FALSE),
    ('Bearing Inspection', 'Critical bearing inspection on Assembly Line 1 - overdue', 'ASM-2024-004', 'Alex Foster', 'PREVENTIVE', 'HIGH', 'IN_PROGRESS', NOW() - INTERVAL '1 day', TRUE),
    ('Hydraulic System Check', 'Routine hydraulic pressure check', 'HYD-2024-006', 'John Smith', 'PREVENTIVE', 'MEDIUM', 'IN_PROGRESS', NOW() + INTERVAL '3 days', FALSE)
) AS r(subject, description, equipment_serial, technician, mtype, priority, stage, due_at, is_overdue)
WHERE c.name = 'XYZ';

-- Insert REPAIRED requests
INSERT INTO maintenance_request (company_id, subject, description, equipment_id, assigned_to_id, type, priority, stage, due_at, is_overdue, repaired_at)
SELECT 
    c.id,
    r.subject,
    r.description,
    get_equipment_id(r.equipment_serial),
    get_user_id(r.technician),
    r.mtype::maintenance_type,
    r.priority::request_priority,
    'REPAIRED'::request_stage,
    NOW() - INTERVAL '5 days',
    FALSE,
    NOW() - INTERVAL '5 days'
FROM company c, (VALUES 
    ('Calibration Complete', 'Annual calibration of Measuring Tool completed', 'MSR-2024-005', 'Sarah Johnson', 'PREVENTIVE', 'LOW'),
    ('Belt Tension Fixed', 'Conveyor belt tension adjusted and tested', 'CNV-2024-007', 'Alex Foster', 'CORRECTIVE', 'MEDIUM')
) AS r(subject, description, equipment_serial, technician, mtype, priority)
WHERE c.name = 'XYZ';

-- Insert SCRAP request (this will also update equipment status via trigger)
INSERT INTO maintenance_request (company_id, subject, description, equipment_id, assigned_to_id, type, priority, stage, due_at, is_overdue)
SELECT 
    c.id,
    'End of Life - Compressor Decommissioned',
    'Old compressor marked for disposal after irreparable failure',
    get_equipment_id('CMP-2024-010'),
    get_user_id('Lisa Brown'),
    'CORRECTIVE'::maintenance_type,
    'LOW'::request_priority,
    'NEW'::request_stage,  -- Will be updated to SCRAP
    NOW() - INTERVAL '10 days',
    FALSE
FROM company c
WHERE c.name = 'XYZ';

-- ============================================================
-- 9. Cleanup helper functions
-- ============================================================
DROP FUNCTION IF EXISTS get_equipment_id(TEXT);
DROP FUNCTION IF EXISTS get_user_id(TEXT);

-- ============================================================
-- 10. Verify Data
-- ============================================================
DO $$
DECLARE
    v_company_count INTEGER;
    v_user_count INTEGER;
    v_equipment_count INTEGER;
    v_request_count INTEGER;
    v_team_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_company_count FROM company;
    SELECT COUNT(*) INTO v_user_count FROM app_user;
    SELECT COUNT(*) INTO v_equipment_count FROM equipment;
    SELECT COUNT(*) INTO v_request_count FROM maintenance_request;
    SELECT COUNT(*) INTO v_team_count FROM maintenance_team;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ GearGuard Seed Data Inserted Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🏢 Companies: %', v_company_count;
    RAISE NOTICE '👷 Users/Technicians: %', v_user_count;
    RAISE NOTICE '⚙️  Equipment: %', v_equipment_count;
    RAISE NOTICE '📋 Maintenance Requests: %', v_request_count;
    RAISE NOTICE '👥 Teams: %', v_team_count;
    RAISE NOTICE '============================================';
END $$;

-- ============================================================
-- Quick Query to View Dashboard Data
-- ============================================================
-- SELECT * FROM v_request_counts;
-- SELECT * FROM v_open_requests;
-- SELECT stage, COUNT(*) FROM maintenance_request GROUP BY stage;
