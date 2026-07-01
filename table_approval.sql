CREATE TABLE approval (
    approval_id INT IDENTITY PRIMARY KEY,
    request_type VARCHAR(15),
    request_id INT,
    [status] VARCHAR(10),
    [timestamp] DATETIME2 DEFAULT GETDATE(),
    approved_by INT,
    comments NVARCHAR(MAX),
    user_id INT,
    FOREIGN KEY (approved_by) REFERENCES [user](user_id),
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);

CREATE TABLE approval_history (
    history_id INT IDENTITY PRIMARY KEY,
    action VARCHAR(100),
    [timestamp] DATETIME2 DEFAULT GETDATE(),
    changed_by INT,
    approval_id INT,
    FOREIGN KEY (changed_by) REFERENCES [user](user_id),
    FOREIGN KEY (approval_id) REFERENCES approval(approval_id)
);

CREATE TABLE notification (
    notification_id INT IDENTITY PRIMARY KEY,
    [type] VARCHAR(15),
    message NVARCHAR(MAX),
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);