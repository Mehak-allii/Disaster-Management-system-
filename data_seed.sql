-- =====================================================================
-- SECTION 8 — DML DATA (SEED DATA)
-- =====================================================================

INSERT INTO [role] (role_name, description) VALUES
('Administrator', 'Full system access — all operations'),
('Emergency Operator', 'Manage emergency reports and team dispatch'),
('Field Officer', 'Submit reports, view assignments'),
('Warehouse Manager', 'Manage inventory and resource allocation'),
('Finance Officer', 'Manage transactions, budgets, donations');
GO

INSERT INTO permission (permission_name, description) VALUES
('CREATE_USER','Create new user accounts'),
('DELETE_USER','Delete user accounts'),
('VIEW_ALL_REPORTS','View all emergency reports'),
('ASSIGN_TEAM','Assign rescue teams to reports'),
('MANAGE_INVENTORY','Update warehouse inventory'),
('APPROVE_RESOURCE_REQ','Approve resource requests'),
('MANAGE_FINANCE','Create and manage financial records'),
('VIEW_AUDIT_LOG','View audit trail'),
('SUBMIT_REPORT','Submit emergency reports'),
('VIEW_OWN_REPORTS','View own submitted reports');
GO

INSERT INTO role_permission (role_id, permission_id)
SELECT 1, permission_id FROM permission;
GO

INSERT INTO role_permission (role_id, permission_id) VALUES
(2,3),(2,4),(2,6),
(3,9),(3,10),
(4,5),(4,6),
(5,7),(5,8);
GO

INSERT INTO [user] (first_name, last_name, email, [password], [status]) VALUES
('Ali','Hassan','admin@disaster.gov.pk','$2b$12$hashed_admin_pw','active'),
('Sara','Malik','operator@disaster.gov.pk','$2b$12$hashed_op_pw','active'),
('Omar','Sheikh','field1@disaster.gov.pk','$2b$12$hashed_field1_pw','active'),
('Fatima','Iqbal','warehouse@disaster.gov.pk','$2b$12$hashed_wm_pw','active'),
('Bilal','Khan','finance@disaster.gov.pk','$2b$12$hashed_fin_pw','active'),
('Ayesha','Siddiqui','field2@disaster.gov.pk','$2b$12$hashed_field2_pw','active');
GO

INSERT INTO user_role VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),(6,3);
GO

INSERT INTO user_phone (user_id, phone, phone_type) VALUES
(1,'+92-300-1234567','mobile'),
(2,'+92-321-9876543','mobile'),
(3,'+92-333-5551234','mobile'),
(4,'+92-311-4449876','mobile'),
(5,'+92-345-7775555','mobile');
GO

INSERT INTO disaster_type (name, description, severity_scale) VALUES
('Flood','Overflowing water','1-5'),
('Earthquake','Seismic activity','1-10'),
('Urban Fire','City fire','1-5'),
('Landslide','Mass movement','1-5'),
('Cyclone','Storm system','1-5');
GO

INSERT INTO emergency_report
(latitude, longitude, address, severity_level, [status], user_id, disaster_id)
VALUES
(33.7294,73.0931,'Rawalpindi Saddar','high','pending',3,1),
(24.8607,67.0011,'Karachi Port','critical','assigned',6,3),
(31.5204,74.3587,'Lahore Model Town','medium','in_progress',3,2),
(25.3960,68.3578,'Hyderabad City','high','pending',6,1),
(30.1798,66.9750,'Quetta','low','resolved',3,4);
GO

INSERT INTO rescue_team
(team_name, team_type, current_latitude, current_longitude, availability_status, max_capacity, contact_number)
VALUES
('Alpha Medical','medical',33.72,73.08,'available',8,'+92-51-9201001'),
('Bravo Fire','fire',24.85,67.01,'assigned',10,'+92-21-9220001'),
('Charlie Search','search',31.50,74.34,'busy',12,'+92-42-9201001'),
('Delta Rescue','rescue',30.17,66.96,'available',10,'+92-81-9201001'),
('Echo Logistics','logistics',33.60,72.90,'available',15,'+92-51-9204001');
GO

INSERT INTO team_assignment (report_id, team_id, assigned_by, [status], notes) VALUES
(2,2,2,'in_progress','Fire response'),
(3,3,2,'assigned','Earthquake'),
(5,4,2,'completed','Landslide cleared');
GO

INSERT INTO resource (name,[type],unit) VALUES
('Rice','food','bag'),
('Water','water','container'),
('Medicine','medicine','box'),
('Tents','shelter','unit'),
('Ropes','equipment','coil');
GO

INSERT INTO warehouse (location,capacity,manager_id,contact_number) VALUES
('Islamabad',5000,4,'+92-51-9211001'),
('Karachi',8000,4,'+92-21-9260001'),
('Lahore',6000,4,'+92-42-9280001');
GO

INSERT INTO inventory (resource_id, warehouse_id, quantity, threshold) VALUES
(1,1,500,50),(1,2,1200,100),(2,1,300,30),
(2,2,800,50),(3,1,150,20),(3,3,200,20);
GO

INSERT INTO hospital (name, location, total_beds, available_beds, contact_number, email, hospital_type) VALUES
('PIMS','Islamabad',800,120,'+92-51-9261170','pims@gov.pk','public'),
('Jinnah','Lahore',600,80,'+92-42-9920001','jhl@gov.pk','public');
GO

INSERT INTO patient (name,[condition],[status],blood_type,emergency_contact,hospital_id) VALUES
('Zubair','critical','ICU','O+','+92-300-1111111',1),
('Sana','stable','Ward','A+','+92-321-2222222',1);
GO

INSERT INTO [transaction] (amount,[type],[status],reference_number,approved_by) VALUES
(500000,'donation','completed','DON-001',1),
(250000,'expense','completed','EXP-001',1);
GO

INSERT INTO donation VALUES (1,'Foundation','organization',1);
INSERT INTO expense VALUES (2,'Medical','Supplies',1);
GO

INSERT INTO resource_request ([status],priority_level,user_id,report_id) VALUES
('pending','critical',3,1),
('approved','high',3,2);
GO

INSERT INTO resource_allocation (quantity,dispatched_quantity,consumed_quantity,allocated_by,resource_id,request_id,warehouse_id)
VALUES (100,100,80,4,1,2,2);
GO

INSERT INTO approval (request_type,request_id,[status],approved_by,comments,user_id) VALUES
('resource',2,'approved',2,'Urgent',3);
GO

INSERT INTO approval_history (action,changed_by,approval_id) VALUES
('APPROVED',2,1);
GO