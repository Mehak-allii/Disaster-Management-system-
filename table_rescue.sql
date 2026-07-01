CREATE TABLE rescue_team (
    team_id INT IDENTITY PRIMARY KEY,
    team_name VARCHAR(100),
    team_type VARCHAR(10),
    current_latitude DECIMAL(10,7),
    current_longitude DECIMAL(10,7),
    availability_status VARCHAR(10),
    max_capacity INT,
    contact_number VARCHAR(20)
);

CREATE TABLE team_assignment (
    assignment_id INT IDENTITY PRIMARY KEY,
    assignment_time DATETIME2 DEFAULT GETDATE(),
    completion_time DATETIME2,
    [status] VARCHAR(15),
    notes NVARCHAR(MAX),
    report_id INT,
    team_id INT,
    assigned_by INT,
    FOREIGN KEY (report_id) REFERENCES emergency_report(report_id),
    FOREIGN KEY (team_id) REFERENCES rescue_team(team_id),
    FOREIGN KEY (assigned_by) REFERENCES [user](user_id)
);

CREATE TABLE team_history (
    history_id INT IDENTITY PRIMARY KEY,
    action VARCHAR(100),
    [timestamp] DATETIME2 DEFAULT GETDATE(),
    team_id INT,
    performed_by INT,
    FOREIGN KEY (team_id) REFERENCES rescue_team(team_id),
    FOREIGN KEY (performed_by) REFERENCES [user](user_id)
);