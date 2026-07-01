CREATE TABLE hospital (
    hospital_id INT IDENTITY PRIMARY KEY,
    name VARCHAR(150),
    location VARCHAR(255),
    total_beds INT,
    available_beds INT,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    hospital_type VARCHAR(10)
);

CREATE TABLE patient (
    patient_id INT IDENTITY PRIMARY KEY,
    name VARCHAR(100),
    [condition] VARCHAR(12),
    [status] VARCHAR(50),
    admitted_time DATETIME2 DEFAULT GETDATE(),
    discharge_time DATETIME2,
    blood_type VARCHAR(4),
    emergency_contact VARCHAR(100),
    hospital_id INT,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);