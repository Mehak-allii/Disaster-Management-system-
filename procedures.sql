-- =====================================================================
-- SECTION 10 — VIEWS
-- =====================================================================

CREATE OR ALTER VIEW v_active_emergencies AS
SELECT er.report_id, er.address, er.severity_level, er.[status],
er.report_time, d.name AS disaster_type,
u.first_name + ' ' + u.last_name AS reported_by,
ta.team_id, t.team_name
FROM emergency_report er
JOIN disaster_type d ON er.disaster_id=d.disaster_id
JOIN [user] u ON er.user_id=u.user_id
LEFT JOIN team_assignment ta ON er.report_id=ta.report_id
LEFT JOIN rescue_team t ON ta.team_id=t.team_id;
GO

CREATE OR ALTER VIEW v_low_stock_alerts AS
SELECT res.name, wh.location, inv.quantity, inv.threshold
FROM inventory inv
JOIN resource res ON inv.resource_id=res.resource_id
JOIN warehouse wh ON inv.warehouse_id=wh.warehouse_id
WHERE inv.quantity <= inv.threshold;
GO

CREATE OR ALTER VIEW v_financial_summary AS
SELECT t.transaction_id,t.[type],t.amount,t.[status],t.[timestamp]
FROM [transaction] t;
GO

CREATE OR ALTER VIEW v_hospital_capacity AS
SELECT hospital_id,name,total_beds,available_beds,
(total_beds-available_beds) AS occupied_beds
FROM hospital;
GO

CREATE OR ALTER VIEW v_user_roles AS
SELECT u.user_id,u.first_name + ' ' + u.last_name AS full_name,
STRING_AGG(r.role_name,',') AS roles
FROM [user] u
JOIN user_role ur ON u.user_id=ur.user_id
JOIN [role] r ON ur.role_id=r.role_id
GROUP BY u.user_id,u.first_name,u.last_name;
GO