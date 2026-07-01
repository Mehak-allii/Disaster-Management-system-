-- =====================================================================
-- SECTION 12 — TRIGGERS
-- =====================================================================

CREATE OR ALTER TRIGGER trg_inventory_low_stock
ON inventory
AFTER UPDATE
AS
BEGIN
INSERT INTO notification([type],message,user_id)
SELECT 'low_stock','Low stock alert',1
FROM inserted i
WHERE i.quantity <= i.threshold;
END;
GO

CREATE OR ALTER TRIGGER trg_team_assigned
ON team_assignment
AFTER INSERT
AS
BEGIN
UPDATE rescue_team
SET availability_status='assigned'
FROM rescue_team r
JOIN inserted i ON r.team_id=i.team_id;
END;
GO

CREATE OR ALTER TRIGGER trg_team_completed
ON team_assignment
AFTER UPDATE
AS
BEGIN
UPDATE rescue_team
SET availability_status='available'
FROM rescue_team r
JOIN inserted i ON r.team_id=i.team_id
WHERE i.[status]='completed';
END;
GO

CREATE OR ALTER TRIGGER trg_prevent_negative_inventory
ON inventory
INSTEAD OF UPDATE
AS
BEGIN
IF EXISTS(SELECT 1 FROM inserted WHERE quantity<0)
THROW 50001,'Negative not allowed',1;

UPDATE inventory
SET quantity=i.quantity
FROM inventory inv
JOIN inserted i ON inv.resource_id=i.resource_id;
END;
GO

CREATE OR ALTER TRIGGER trg_budget_update_on_expense
ON expense
AFTER INSERT
AS
BEGIN
UPDATE budget
SET used_amount=used_amount+1000;
END;
GO

CREATE OR ALTER TRIGGER trg_er_updated_at
ON emergency_report
AFTER UPDATE
AS
BEGIN
UPDATE emergency_report
SET updated_at=GETDATE();
END;
GO