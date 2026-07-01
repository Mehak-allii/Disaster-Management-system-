CREATE TABLE [user] (
    user_id INT IDENTITY PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    [password] VARCHAR(255),
    [status] VARCHAR(10) DEFAULT 'active',
    created_at DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2,
    failed_login_attempts INT DEFAULT 0,
    is_active BIT DEFAULT 1
);

CREATE TABLE user_phone (
    phone_id INT IDENTITY PRIMARY KEY,
    user_id INT,
    phone VARCHAR(20),
    phone_type VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);

CREATE TABLE [role] (
    role_id INT IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE,
    description NVARCHAR(MAX)
);

CREATE TABLE permission (
    permission_id INT IDENTITY PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE,
    description NVARCHAR(MAX)
);

CREATE TABLE user_role (
    user_id INT,
    role_id INT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES [user](user_id),
    FOREIGN KEY (role_id) REFERENCES [role](role_id)
);

CREATE TABLE role_permission (
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES [role](role_id),
    FOREIGN KEY (permission_id) REFERENCES permission(permission_id)
);

CREATE TABLE login_session (
    session_id INT IDENTITY PRIMARY KEY,
    login_time DATETIME2 DEFAULT GETDATE(),
    logout_time DATETIME2,
    ip_address VARCHAR(45),
    device_info VARCHAR(200),
    is_active BIT DEFAULT 1,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);

CREATE TABLE audit_log (
    audit_log_id INT IDENTITY PRIMARY KEY,
    entity_name VARCHAR(100),
    entity_id INT,
    action VARCHAR(10),
    old_value NVARCHAR(MAX),
    new_value NVARCHAR(MAX),
    [timestamp] DATETIME2 DEFAULT GETDATE(),
    ip_address VARCHAR(45),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);