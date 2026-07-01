CREATE TABLE disaster_type (
    disaster_id INT IDENTITY PRIMARY KEY,
    name VARCHAR(100),
    description NVARCHAR(MAX),
    severity_scale VARCHAR(50)
);

CREATE TABLE emergency_report (
    report_id INT IDENTITY PRIMARY KEY,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    address VARCHAR(255),
    severity_level VARCHAR(10),
    [status] VARCHAR(15) DEFAULT 'pending',
    report_time DATETIME2 DEFAULT GETDATE(),
    resolved_at DATETIME2,
    updated_at DATETIME2,
    user_id INT,
    disaster_id INT,
    FOREIGN KEY (user_id) REFERENCES [user](user_id),
    FOREIGN KEY (disaster_id) REFERENCES disaster_type(disaster_id)
);