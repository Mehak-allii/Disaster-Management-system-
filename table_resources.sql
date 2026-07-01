CREATE TABLE resource (
    resource_id INT IDENTITY PRIMARY KEY,
    name VARCHAR(100),
    [type] VARCHAR(10),
    unit VARCHAR(30)
);

CREATE TABLE warehouse (
    warehouse_id INT IDENTITY PRIMARY KEY,
    location VARCHAR(255),
    capacity INT,
    manager_id INT,
    contact_number VARCHAR(20),
    FOREIGN KEY (manager_id) REFERENCES [user](user_id)
);

CREATE TABLE inventory (
    resource_id INT,
    warehouse_id INT,
    quantity INT DEFAULT 0,
    threshold INT DEFAULT 10,
    last_updated DATETIME2,
    PRIMARY KEY (resource_id, warehouse_id),
    FOREIGN KEY (resource_id) REFERENCES resource(resource_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
);

CREATE TABLE resource_request (
    request_id INT IDENTITY PRIMARY KEY,
    [status] VARCHAR(10),
    priority_level VARCHAR(10),
    created_at DATETIME2 DEFAULT GETDATE(),
    rejection_reason NVARCHAR(MAX),
    user_id INT,
    report_id INT,
    FOREIGN KEY (user_id) REFERENCES [user](user_id),
    FOREIGN KEY (report_id) REFERENCES emergency_report(report_id)
);

CREATE TABLE resource_allocation (
    allocation_id INT IDENTITY PRIMARY KEY,
    quantity INT,
    dispatched_quantity INT DEFAULT 0,
    consumed_quantity INT DEFAULT 0,
    allocated_at DATETIME2 DEFAULT GETDATE(),
    allocated_by INT,
    resource_id INT,
    request_id INT,
    warehouse_id INT,
    FOREIGN KEY (allocated_by) REFERENCES [user](user_id),
    FOREIGN KEY (resource_id) REFERENCES resource(resource_id),
    FOREIGN KEY (request_id) REFERENCES resource_request(request_id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(warehouse_id)
);