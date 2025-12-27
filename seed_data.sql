-- GearGuard Seed Data
-- Run this after gearguard_workbench_pg18.sql
-- This will populate the database with sample data for testing

BEGIN;

SET search_path TO app, public;

-- Get the company ID (should be 'XYZ')
DO $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT id INTO v_company_id FROM company WHERE name = 'XYZ';
  
  -- Insert Departments
  INSERT INTO department (company_id, name) VALUES
    (v_company_id, 'Manufacturing'),
    (v_company_id, 'Warehouse'),
    (v_company_id, 'IT Department'),
    (v_company_id, 'Maintenance Workshop')
  ON CONFLICT (company_id, name) DO NOTHING;

  -- Insert Users
  INSERT INTO app_user (company_id, full_name, email, is_active) VALUES
    (v_company_id, 'Vansh Momaya', 'vanshmomaya@gearguard.com', true),
    (v_company_id, 'Moksh Jhaveri', 'mokshjhaveri@gearguard.com', true),
    (v_company_id, 'Rutu Mehta', 'rutumehta@gearguard.com', true),
    (v_company_id, 'Megh Dave', 'meghdave@gearguard.com', true),
    (v_company_id, 'Ebrahim Gamdiwala', 'ebrahimgamdiwala@gearguard.com', true),
    (v_company_id, 'Robert Brown', 'robert.brown@gearguard.com', true),
    (v_company_id, 'Lisa Anderson', 'lisa.anderson@gearguard.com', true),
    (v_company_id, 'David Martinez', 'david.martinez@gearguard.com', true),
    (v_company_id, 'Jennifer Taylor', 'jennifer.taylor@gearguard.com', true)
  ON CONFLICT (company_id, email) DO NOTHING;

  -- Insert Equipment Categories
  INSERT INTO equipment_category (company_id, name) VALUES
    (v_company_id, 'CNC Machines'),
    (v_company_id, 'Forklifts'),
    (v_company_id, 'Servers'),
    (v_company_id, 'Laptops'),
    (v_company_id, 'Conveyor Systems'),
    (v_company_id, 'HVAC Systems')
  ON CONFLICT (company_id, name) DO NOTHING;

  -- Insert Maintenance Teams
  INSERT INTO maintenance_team (company_id, name) VALUES
    (v_company_id, 'Mechanical Team'),
    (v_company_id, 'IT Support Team'),
    (v_company_id, 'Electrical Team')
  ON CONFLICT (company_id, name) DO NOTHING;

END $$;

-- Now insert team members and equipment with proper IDs
DO $$
DECLARE
  v_company_id uuid;
  v_mech_team_id uuid;
  v_it_team_id uuid;
  v_elec_team_id uuid;
  v_user1_id uuid;
  v_user2_id uuid;
  v_user3_id uuid;
  v_user4_id uuid;
  v_user5_id uuid;
  v_user6_id uuid;
  v_cnc_cat_id uuid;
  v_forklift_cat_id uuid;
  v_server_cat_id uuid;
  v_laptop_cat_id uuid;
  v_conveyor_cat_id uuid;
  v_hvac_cat_id uuid;
  v_mfg_dept_id uuid;
  v_warehouse_dept_id uuid;
  v_it_dept_id uuid;
  v_equip1_id uuid;
  v_equip2_id uuid;
  v_equip3_id uuid;
  v_equip4_id uuid;
  v_equip5_id uuid;
BEGIN
  -- Get IDs
  SELECT id INTO v_company_id FROM company WHERE name = 'XYZ';
  SELECT id INTO v_mech_team_id FROM maintenance_team WHERE name = 'Mechanical Team';
  SELECT id INTO v_it_team_id FROM maintenance_team WHERE name = 'IT Support Team';
  SELECT id INTO v_elec_team_id FROM maintenance_team WHERE name = 'Electrical Team';
  
  SELECT id INTO v_user1_id FROM app_user WHERE email = 'vanshmomaya@gearguard.com';
  SELECT id INTO v_user2_id FROM app_user WHERE email = 'mokshjhaveri@gearguard.com';
  SELECT id INTO v_user3_id FROM app_user WHERE email = 'rutumehta@gearguard.com';
  SELECT id INTO v_user4_id FROM app_user WHERE email = 'meghdave@gearguard.com';
  SELECT id INTO v_user5_id FROM app_user WHERE email = 'robert.brown@gearguard.com';
  SELECT id INTO v_user6_id FROM app_user WHERE email = 'lisa.anderson@gearguard.com';
  
  SELECT id INTO v_cnc_cat_id FROM equipment_category WHERE name = 'CNC Machines';
  SELECT id INTO v_forklift_cat_id FROM equipment_category WHERE name = 'Forklifts';
  SELECT id INTO v_server_cat_id FROM equipment_category WHERE name = 'Servers';
  SELECT id INTO v_laptop_cat_id FROM equipment_category WHERE name = 'Laptops';
  SELECT id INTO v_conveyor_cat_id FROM equipment_category WHERE name = 'Conveyor Systems';
  SELECT id INTO v_hvac_cat_id FROM equipment_category WHERE name = 'HVAC Systems';
  
  SELECT id INTO v_mfg_dept_id FROM department WHERE name = 'Manufacturing';
  SELECT id INTO v_warehouse_dept_id FROM department WHERE name = 'Warehouse';
  SELECT id INTO v_it_dept_id FROM department WHERE name = 'IT Department';

  -- Insert Team Members
  INSERT INTO maintenance_team_member (team_id, user_id) VALUES
    (v_mech_team_id, v_user1_id),
    (v_mech_team_id, v_user2_id),
    (v_it_team_id, v_user3_id),
    (v_it_team_id, v_user4_id),
    (v_elec_team_id, v_user5_id),
    (v_elec_team_id, v_user6_id)
  ON CONFLICT (team_id, user_id) DO NOTHING;

  -- Insert Equipment
  INSERT INTO equipment (
    company_id, name, serial_number, category_id, department_id, 
    owner_user_id, maintenance_team_id, default_technician_id,
    location, purchase_date, warranty_end_date, status
  ) VALUES
    (v_company_id, 'CNC Machine #1', 'CNC-2024-001', v_cnc_cat_id, v_mfg_dept_id, 
     NULL, v_mech_team_id, v_user1_id, 'Factory Floor A', '2023-01-15', '2026-01-15', 'ACTIVE'),
    
    (v_company_id, 'CNC Machine #2', 'CNC-2024-002', v_cnc_cat_id, v_mfg_dept_id,
     NULL, v_mech_team_id, v_user2_id, 'Factory Floor A', '2023-03-20', '2026-03-20', 'ACTIVE'),
    
    (v_company_id, 'Forklift #3', 'FL-2023-003', v_forklift_cat_id, v_warehouse_dept_id,
     NULL, v_mech_team_id, v_user1_id, 'Warehouse B', '2023-06-20', NULL, 'ACTIVE'),
    
    (v_company_id, 'Forklift #5', 'FL-2024-005', v_forklift_cat_id, v_warehouse_dept_id,
     NULL, v_mech_team_id, v_user2_id, 'Warehouse A', '2024-02-10', '2027-02-10', 'ACTIVE'),
    
    (v_company_id, 'Database Server #1', 'SRV-2024-DB1', v_server_cat_id, v_it_dept_id,
     NULL, v_it_team_id, v_user3_id, 'Data Center Room 1', '2024-01-05', '2027-01-05', 'ACTIVE'),
    
    (v_company_id, 'Web Server #2', 'SRV-2024-WEB2', v_server_cat_id, v_it_dept_id,
     NULL, v_it_team_id, v_user4_id, 'Data Center Room 1', '2024-03-15', '2027-03-15', 'ACTIVE'),
    
    (v_company_id, 'Laptop - Engineering', 'LAP-2023-ENG01', v_laptop_cat_id, v_mfg_dept_id,
     v_user1_id, v_it_team_id, v_user3_id, 'Engineering Office', '2023-09-01', '2026-09-01', 'ACTIVE'),
    
    (v_company_id, 'Conveyor Belt System A', 'CONV-2022-A01', v_conveyor_cat_id, v_warehouse_dept_id,
     NULL, v_mech_team_id, v_user2_id, 'Warehouse Sorting Area', '2022-05-10', '2025-05-10', 'ACTIVE'),
    
    (v_company_id, 'HVAC Unit - Floor 1', 'HVAC-2021-F1', v_hvac_cat_id, v_mfg_dept_id,
     NULL, v_elec_team_id, v_user5_id, 'Factory Floor 1 Ceiling', '2021-11-20', '2024-11-20', 'ACTIVE'),
    
    (v_company_id, 'Old Forklift #1', 'FL-2018-001', v_forklift_cat_id, v_warehouse_dept_id,
     NULL, v_mech_team_id, v_user1_id, 'Warehouse C - Retired', '2018-03-15', '2021-03-15', 'SCRAPPED')
  ON CONFLICT (company_id, serial_number) DO NOTHING;

  -- Get equipment IDs for maintenance requests
  SELECT id INTO v_equip1_id FROM equipment WHERE serial_number = 'CNC-2024-001';
  SELECT id INTO v_equip2_id FROM equipment WHERE serial_number = 'FL-2023-003';
  SELECT id INTO v_equip3_id FROM equipment WHERE serial_number = 'SRV-2024-DB1';
  SELECT id INTO v_equip4_id FROM equipment WHERE serial_number = 'CONV-2022-A01';
  SELECT id INTO v_equip5_id FROM equipment WHERE serial_number = 'HVAC-2021-F1';

  -- Insert Maintenance Requests
  INSERT INTO maintenance_request (
    company_id, subject, description, equipment_id, created_by_id,
    type, priority, stage, request_date, scheduled_at, duration_minutes, due_at
  ) VALUES
    -- NEW Requests
    (v_company_id, 'Unusual grinding noise during operation', 
     'CNC machine making loud grinding noise when spindle rotates at high speed. Started yesterday afternoon.',
     v_equip1_id, v_user6_id, 'CORRECTIVE', 'HIGH', 'NEW', CURRENT_DATE, 
     NULL, 0, CURRENT_DATE + INTERVAL '2 days'),
    
    (v_company_id, 'Hydraulic fluid leak detected',
     'Small hydraulic fluid leak noticed under the forklift. Needs immediate attention.',
     v_equip2_id, v_user6_id, 'CORRECTIVE', 'URGENT', 'NEW', CURRENT_DATE,
     NULL, 0, CURRENT_DATE + INTERVAL '1 day'),
    
    -- IN_PROGRESS Requests
    (v_company_id, 'Server performance degradation',
     'Database queries running slower than usual. CPU usage at 85% constantly.',
     v_equip3_id, v_user4_id, 'CORRECTIVE', 'HIGH', 'IN_PROGRESS', CURRENT_DATE - INTERVAL '1 day',
     NULL, 120, CURRENT_DATE + INTERVAL '1 day'),
    
    (v_company_id, 'Conveyor belt alignment issue',
     'Belt is slightly off-center causing packages to fall off occasionally.',
     v_equip4_id, v_user6_id, 'CORRECTIVE', 'MEDIUM', 'IN_PROGRESS', CURRENT_DATE - INTERVAL '2 days',
     NULL, 180, CURRENT_DATE),
    
    -- PREVENTIVE Maintenance (Scheduled)
    (v_company_id, 'Quarterly CNC maintenance',
     'Regular quarterly maintenance check for CNC machine including lubrication and calibration.',
     v_equip1_id, v_user1_id, 'PREVENTIVE', 'MEDIUM', 'NEW', CURRENT_DATE,
     CURRENT_DATE + INTERVAL '7 days', 0, NULL),
    
    (v_company_id, 'Monthly server backup verification',
     'Verify backup systems and test restore procedures.',
     v_equip3_id, v_user3_id, 'PREVENTIVE', 'MEDIUM', 'NEW', CURRENT_DATE,
     CURRENT_DATE + INTERVAL '5 days', 0, NULL),
    
    (v_company_id, 'HVAC filter replacement',
     'Scheduled filter replacement and system inspection.',
     v_equip5_id, v_user5_id, 'PREVENTIVE', 'LOW', 'NEW', CURRENT_DATE,
     CURRENT_DATE + INTERVAL '10 days', 0, NULL),
    
    -- REPAIRED Requests
    (v_company_id, 'Forklift brake system repair',
     'Brake pads were worn out and needed replacement.',
     v_equip2_id, v_user6_id, 'CORRECTIVE', 'HIGH', 'REPAIRED', CURRENT_DATE - INTERVAL '5 days',
     NULL, 240, NULL);

  -- Add some comments to requests
  INSERT INTO request_comment (request_id, author_id, body) 
  SELECT 
    mr.id,
    v_user1_id,
    'Started investigating the issue. Will update soon.'
  FROM maintenance_request mr
  WHERE mr.stage = 'IN_PROGRESS' AND mr.type = 'CORRECTIVE'
  LIMIT 1;

  INSERT INTO request_comment (request_id, author_id, body)
  SELECT 
    mr.id,
    v_user2_id,
    'Alignment adjusted. Testing for 24 hours before marking as complete.'
  FROM maintenance_request mr
  WHERE mr.subject LIKE '%Conveyor%'
  LIMIT 1;

END $$;

COMMIT;

-- Verify the data
SELECT 'Departments:', COUNT(*) FROM department;
SELECT 'Users:', COUNT(*) FROM app_user;
SELECT 'Equipment Categories:', COUNT(*) FROM equipment_category;
SELECT 'Maintenance Teams:', COUNT(*) FROM maintenance_team;
SELECT 'Team Members:', COUNT(*) FROM maintenance_team_member;
SELECT 'Equipment:', COUNT(*) FROM equipment;
SELECT 'Maintenance Requests:', COUNT(*) FROM maintenance_request;
SELECT 'Comments:', COUNT(*) FROM request_comment;
