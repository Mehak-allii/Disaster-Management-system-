CREATE TABLE [transaction] (
    transaction_id INT IDENTITY PRIMARY KEY,
    amount DECIMAL(12,2),
    [type] VARCHAR(15),
    [timestamp] DATETIME2 DEFAULT GETDATE(),
    [status] VARCHAR(10),
    reference_number VARCHAR(50),
    approved_by INT,
    FOREIGN KEY (approved_by) REFERENCES [user](user_id)
);